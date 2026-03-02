import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const ctx = await requireOrgContext();

	const today = new Date();
	const now = new Date();

	const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
	const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
	const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const meetingWhere: any = { organisationId: ctx.organisationId };
	if (ctx.role === "TEACHER") {
		meetingWhere.createdById = ctx.userId;
	}

	const [
		analyticsMeetings,
		upcomingMeetings,
		needsReviewCount,
		activeStudentsCount,
		archivedStudentsCount,
		invoiceRows,
		keyDates,
		upcomingCheckIns,
		recentLessons,
	] = await Promise.all([
		prisma.meeting.findMany({
			where: {
				...meetingWhere,
				startTime: { gte: eightWeeksAgo, lte: now },
			},
			select: {
				id: true,
				startTime: true,
				endTime: true,
				isCompleted: true,
				studentId: true,
			},
		}),
		prisma.meeting.findMany({
			where: {
				...meetingWhere,
				startTime: { gte: now },
			},
			include: { student: true },
			orderBy: { startTime: "asc" },
			take: 20,
		}),
		prisma.meeting.count({
			where: {
				...meetingWhere,
				OR: [
					{ status: "NEEDS_REVIEW" as any },
					{
						AND: [
							{ status: "IN_PROGRESS" as any },
							{ endTime: { lt: now } },
						],
					},
				],
			},
		}),
		prisma.student.count({
			where: { organisationId: ctx.organisationId, isArchived: false },
		}),
		prisma.student.count({
			where: { organisationId: ctx.organisationId, isArchived: true },
		}),
		prisma.invoice.findMany({
			where: {
				organisationId: ctx.organisationId,
				createdAt: { gte: eightWeeksAgo },
			},
			select: { id: true, createdAt: true, total: true },
		}),
		(prisma as any).keyDate?.findMany({
			where: {
				organisationId: ctx.organisationId,
				date: {
					gte: today,
					lte: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
				},
			},
			orderBy: { date: "asc" },
		}) ?? [],
		prisma.checkIn.findMany({
			where: {
				organisationId: ctx.organisationId,
				scheduledDate: { gte: now, lte: thirtyDaysFromNow },
			},
			include: { student: true },
			orderBy: { scheduledDate: "asc" },
			take: 20,
		}),
		prisma.meeting.findMany({
			where: {
				...meetingWhere,
				startTime: {
					gte: thirtyDaysAgo,
					lte: now,
				},
			},
			include: { student: true },
			orderBy: { startTime: "desc" },
			take: 50,
		}),
	]);

	// ── Lesson hours by week ──────────────────────────────────────────────────

	const groupByWeek = (date: Date) => {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		const day = d.getDay();
		const diffToMonday = (day + 6) % 7;
		d.setDate(d.getDate() - diffToMonday);
		const key = d.toISOString().slice(0, 10);
		const label = `${d.getDate()}/${d.getMonth() + 1}`;
		return { key, label };
	};

	const currentWeekKey = groupByWeek(now).key;
	const lessonHoursByWeekMap = new Map<string, { label: string; value: number }>();

	for (const meeting of analyticsMeetings) {
		const start = new Date(meeting.startTime);
		const end = new Date(meeting.endTime);
		const durationHours = Math.max(0, (end.getTime() - start.getTime()) / (60 * 60 * 1000));
		const { key, label } = groupByWeek(start);
		const existing = lessonHoursByWeekMap.get(key) ?? { label, value: 0 };
		existing.value += durationHours;
		lessonHoursByWeekMap.set(key, existing);
	}

	const last8WeekKeys: { key: string; label: string }[] = [];
	for (let i = 7; i >= 0; i--) {
		const d = new Date(currentWeekKey);
		d.setDate(d.getDate() - 7 * i);
		last8WeekKeys.push(groupByWeek(d));
	}

	const sortedLessonHours = last8WeekKeys.map(({ key, label }) => ({
		label,
		value: Number((lessonHoursByWeekMap.get(key)?.value ?? 0).toFixed(1)),
	}));

	const teachingHoursThisWeek = Number(
		(lessonHoursByWeekMap.get(currentWeekKey)?.value ?? 0).toFixed(1),
	);

	const prevWeekKey = (() => {
		const d = new Date(currentWeekKey);
		d.setDate(d.getDate() - 7);
		return groupByWeek(d).key;
	})();
	const prevWeekHours = lessonHoursByWeekMap.get(prevWeekKey)?.value ?? 0;
	const hoursPercentChange =
		prevWeekHours > 0 ? ((teachingHoursThisWeek - prevWeekHours) / prevWeekHours) * 100 : 0;

	// ── Invoice/revenue by week ───────────────────────────────────────────────

	const invoiceTotalsByWeekMap = new Map<string, { label: string; value: number }>();
	for (const invoice of invoiceRows) {
		const { key, label } = groupByWeek(invoice.createdAt);
		const existing = invoiceTotalsByWeekMap.get(key) ?? { label, value: 0 };
		existing.value += Number(invoice.total ?? 0) / 100;
		invoiceTotalsByWeekMap.set(key, existing);
	}

	const sortedInvoiceTotals = last8WeekKeys.map(({ key, label }) => ({
		label,
		value: Number((invoiceTotalsByWeekMap.get(key)?.value ?? 0).toFixed(2)),
	}));

	const totalRevenue8Weeks = sortedInvoiceTotals.reduce((s, d) => s + d.value, 0);
	const currentWeekRevenue = invoiceTotalsByWeekMap.get(currentWeekKey)?.value ?? 0;
	const prevWeekRevenue = invoiceTotalsByWeekMap.get(prevWeekKey)?.value ?? 0;
	const revenuePercentChange =
		prevWeekRevenue > 0
			? ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
			: 0;

	// ── Upcoming lessons count by day ─────────────────────────────────────────

	const next7DaysLabels: { key: string; label: string }[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(now);
		d.setDate(d.getDate() + i);
		const key = d.toISOString().slice(0, 10);
		const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
		next7DaysLabels.push({ key, label });
	}

	const lessonsPerDayMap = new Map<string, number>();
	for (const m of upcomingMeetings) {
		const key = new Date(m.startTime).toISOString().slice(0, 10);
		lessonsPerDayMap.set(key, (lessonsPerDayMap.get(key) ?? 0) + 1);
	}

	const upcomingLessonsBarData = next7DaysLabels.map(({ key, label }) => ({
		label,
		value: lessonsPerDayMap.get(key) ?? 0,
	}));

	const totalUpcomingLessons = upcomingMeetings.length;

	// ── Key dates ─────────────────────────────────────────────────────────────

	const upcomingKeyDates = (keyDates as any[]).map((kd) => {
		const date = new Date(kd.date);
		return {
			id: kd.id as string,
			title: kd.title as string,
			date,
		};
	});

	// ── Schedule events (flatten for ScheduleCard) ────────────────────────────

	const schedLessons = upcomingMeetings.map((m) => ({
		id: m.id,
		type: "lesson" as const,
		status: m.status as "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "NEEDS_REVIEW" | "COMPLETED",
		title: m.title || "Lesson",
		description: m.description || "",
		participant: m.student
			? `${m.student.firstName} ${m.student.lastName}`
			: "Unassigned",
		startTime: new Date(m.startTime).toISOString(),
		endTime: new Date(m.endTime).toISOString(),
	}));

	const schedEvents = upcomingKeyDates.map((kd) => ({
		id: kd.id,
		type: "event" as const,
		title: kd.title,
		description: "",
		participant: "All",
		startTime: kd.date.toISOString(),
		endTime: undefined as string | undefined,
	}));

	const schedCheckins = upcomingCheckIns.map((ci) => ({
		id: ci.id,
		type: "checkin" as const,
		title: `Check-in: ${ci.student.firstName} ${ci.student.lastName}`,
		description: ci.notes || "",
		participant: `${ci.student.firstName} ${ci.student.lastName}`,
		startTime: new Date(ci.scheduledDate).toISOString(),
		endTime: undefined as string | undefined,
	}));

	// ── Lesson log rows (recent past lessons) ─────────────────────────────────

	const lessonLogRows = recentLessons.map((lesson) => ({
		id: lesson.id,
		studentId: lesson.student ? lesson.student.id : null,
		studentFirstName: lesson.student ? lesson.student.firstName : "Unknown",
		studentLastName: lesson.student ? lesson.student.lastName : "",
		subjects: lesson.student?.subjects || "",
		isArchived: lesson.student?.isArchived ?? false,
		lessonDate: new Date(lesson.startTime).toISOString(),
		lessonTitle: lesson.title || "Lesson",
		status: (lesson as any).status as string,
	}));

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

	return (
		<DashboardClient
			userName={session?.user?.name ?? null}
			todayFormatted={formatDate(today)}
			lessonHoursData={sortedLessonHours}
			teachingHoursThisWeek={teachingHoursThisWeek}
			hoursPercentChange={Math.round(hoursPercentChange)}
			activeStudentsCount={activeStudentsCount}
			archivedStudentsCount={archivedStudentsCount}
			revenueBarData={sortedInvoiceTotals}
			totalRevenue={totalRevenue8Weeks}
			revenuePercentChange={Math.round(revenuePercentChange)}
			upcomingLessonsBarData={upcomingLessonsBarData}
			totalUpcomingLessons={totalUpcomingLessons}
			scheduleLessons={schedLessons}
			scheduleEvents={schedEvents}
			scheduleCheckins={schedCheckins}
			needsReviewCount={needsReviewCount}
			lessonLogRows={lessonLogRows}
		/>
	);
}
