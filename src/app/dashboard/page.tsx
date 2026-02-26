import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import Link from "next/link";

interface MiniAreaChartPoint {
	label: string;
	value: number;
}

interface MiniAreaChartProps {
	data: MiniAreaChartPoint[];
	colorClass?: string;
}

function MiniAreaChart({ data, colorClass = "text-teal-400 fill-teal-100" }: MiniAreaChartProps) {
	if (!data.length || data.every((d) => d.value === 0)) {
		return (
			<div className="h-24 flex items-center justify-center text-xs text-gray-400">
				Not enough data yet
			</div>
		);
	}

	const width = 220;
	const height = 80;
	const paddingX = 4;
	const paddingY = 4;

	const maxValue = Math.max(...data.map((d) => d.value)) || 1;
	const minValue = 0;
	const range = maxValue - minValue || 1;

	const stepX = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

	const points = data.map((d, index) => {
		const x = paddingX + index * stepX;
		const normalized = (d.value - minValue) / range;
		const y = height - paddingY - normalized * (height - paddingY * 2);
		return { x, y };
	});

	const pathD = points
		.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
		.join(" ");

	const areaD = [
		points.length ? `M ${points[0].x} ${height - paddingY}` : "",
		...points.map((p) => `L ${p.x} ${p.y}`),
		points.length ? `L ${points[points.length - 1].x} ${height - paddingY}` : "",
		"Z",
	].join(" ");

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className={`w-full h-24 ${colorClass}`}
			role="img"
			aria-hidden="true"
		>
			<path d={areaD} className="opacity-30" />
			<path d={pathD} className="stroke-current" strokeWidth={2} fill="none" />
		</svg>
	);
}

interface AnalyticsCardProps {
	title: string;
	children: React.ReactNode;
}

function AnalyticsCard({ title, children }: AnalyticsCardProps) {
	return (
		<div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-base font-semibold text-gray-900">
						{title}
					</h2>
				</div>
			</div>
			{children}
		</div>
	);
}

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const ctx = await requireOrgContext();

	const today = new Date();
	const now = new Date();

	const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const meetingWhere: any = { organisationId: ctx.organisationId };
	if (ctx.role === "TEACHER") {
		meetingWhere.createdById = ctx.userId;
	}

	const [analyticsMeetings, upcomingMeetings, pastMeetings, newStudentsThisMonth, invoiceRows] =
		await Promise.all([
			prisma.meeting.findMany({
				where: {
					...meetingWhere,
					startTime: {
						gte: eightWeeksAgo,
					},
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
					startTime: {
						gte: now,
					},
				},
				include: {
					student: true,
				},
				orderBy: { startTime: "asc" },
				take: 6,
			}),
			prisma.meeting.findMany({
				where: {
					...meetingWhere,
					startTime: {
						lt: now,
						gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
					},
				},
				include: {
					student: true,
				},
				orderBy: { startTime: "desc" },
				take: 6,
			}),
			prisma.student.count({
				where: {
					organisationId: ctx.organisationId,
					createdAt: {
						gte: startOfMonth,
					},
				},
			}),
			prisma.invoice.findMany({
				where: {
					organisationId: ctx.organisationId,
					createdAt: {
						gte: eightWeeksAgo,
					},
				},
				select: {
					id: true,
					createdAt: true,
					total: true,
				},
			}),
		]);

	const formatTime = (date: Date) =>
		date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	const formatEventDate = (date: Date) => {
		const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const tomorrow = new Date(todayDate);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		if (eventDate.getTime() === todayDate.getTime()) return "Today";
		if (eventDate.getTime() === tomorrow.getTime()) return "Tomorrow";
		return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
	};

	const groupByWeek = (date: Date) => {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		const day = d.getDay();
		const diffToMonday = (day + 6) % 7;
		d.setDate(d.getDate() - diffToMonday);
		const key = d.toISOString().slice(0, 10);
		const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
		return { key, label };
	};

	const lessonHoursByWeekMap = new Map<string, { label: string; value: number }>();
	const activeStudentIds = new Set<number>();

	for (const meeting of analyticsMeetings) {
		if (meeting.studentId != null) {
			activeStudentIds.add(meeting.studentId);
		}
		const start = new Date(meeting.startTime);
		const end = new Date(meeting.endTime);
		const durationHours = Math.max(0, (end.getTime() - start.getTime()) / (60 * 60 * 1000));
		const { key, label } = groupByWeek(start);
		const existing = lessonHoursByWeekMap.get(key) ?? { label, value: 0 };
		existing.value += durationHours;
		lessonHoursByWeekMap.set(key, existing);
	}

	const sortedLessonHours = Array.from(lessonHoursByWeekMap.entries())
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([, bucket]) => ({
			label: bucket.label,
			value: Number(bucket.value.toFixed(1)),
		}));

	const invoiceTotalsByWeekMap = new Map<string, { label: string; value: number }>();

	for (const invoice of invoiceRows) {
		const { key, label } = groupByWeek(invoice.createdAt);
		const existing = invoiceTotalsByWeekMap.get(key) ?? { label, value: 0 };
		existing.value += Number(invoice.total ?? 0);
		invoiceTotalsByWeekMap.set(key, existing);
	}

	const sortedInvoiceTotals = Array.from(invoiceTotalsByWeekMap.entries())
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([, bucket]) => ({
			label: bucket.label,
			value: Number(bucket.value.toFixed(2)),
		}));

	let lessonsThisWeek = 0;
	let completedThisWeek = 0;
	const startOfWeek = (() => {
		const d = new Date(now);
		d.setHours(0, 0, 0, 0);
		const day = d.getDay();
		const diffToMonday = (day + 6) % 7;
		d.setDate(d.getDate() - diffToMonday);
		return d;
	})();
	const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

	for (const meeting of analyticsMeetings) {
		const start = new Date(meeting.startTime);
		if (start >= startOfWeek && start < endOfWeek) {
			lessonsThisWeek += 1;
			if (meeting.isCompleted) {
				completedThisWeek += 1;
			}
		}
	}

	const totalLessonCount = analyticsMeetings.length;
	const totalLessonHours = analyticsMeetings.reduce((sum, m) => {
		const start = new Date(m.startTime);
		const end = new Date(m.endTime);
		return sum + Math.max(0, (end.getTime() - start.getTime()) / (60 * 60 * 1000));
	}, 0);
	const averageLessonLength =
		totalLessonCount > 0 ? Math.round((totalLessonHours / totalLessonCount) * 60) : 0;

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold" style={{ color: "#3D4756" }}>
						Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
					</h1>
				</div>
				<div
					className="flex items-center rounded-full px-4 py-2 shadow-sm"
					style={{ backgroundColor: "#FEF5eF" }}
				>
					<svg
						className="w-6 h-6 mr-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						style={{ color: "#584b53" }}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<p className="text-base" style={{ color: "#584b53" }}>
						Today is {formatDate(today)}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<AnalyticsCard title="Client Analytics">
					<div className="flex items-end justify-between gap-4">
						<div className="flex-1 flex gap-6">
							<div>
								<p className="text-sm text-gray-600">Active students (last 8 weeks)</p>
								<p className="text-3xl font-semibold text-gray-900">
									{activeStudentIds.size}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">New this month</p>
								<p className="text-3xl font-semibold text-gray-900">
									{newStudentsThisMonth}
								</p>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-sm text-gray-500 mb-1">Lesson hours (last 8 weeks)</p>
						<MiniAreaChart data={sortedLessonHours} colorClass="text-emerald-500 fill-emerald-100" />
					</div>
				</AnalyticsCard>

				<AnalyticsCard title="Tutor Analytics">
					<div className="flex items-end justify-between gap-4">
						<div className="flex-1 flex gap-6">
							<div>
								<p className="text-sm text-gray-600">Lessons this week</p>
								<p className="text-3xl font-semibold text-gray-900">
									{lessonsThisWeek}
								</p>
								{lessonsThisWeek > 0 && (
									<p className="text-xs text-gray-500 mt-0.5">
										{completedThisWeek} completed
									</p>
								)}
							</div>
							<div>
								<p className="text-sm text-gray-600">Avg. lesson length</p>
								<p className="text-3xl font-semibold text-gray-900">
									{averageLessonLength}
									<span className="text-base text-gray-500 ml-1">min</span>
								</p>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-sm text-gray-500 mb-1">Raised invoices (last 8 weeks)</p>
						<MiniAreaChart
							data={sortedInvoiceTotals}
							colorClass="text-amber-500 fill-amber-100"
						/>
					</div>
				</AnalyticsCard>

				<AnalyticsCard title="Upcoming Lessons">
					{upcomingMeetings.length > 0 ? (
						<ul className="divide-y divide-gray-100">
							{upcomingMeetings.map((meeting) => {
								const start = new Date(meeting.startTime);
								const end = new Date(meeting.endTime);
								return (
									<li key={meeting.id} className="py-2.5 flex items-start justify-between gap-3">
										<div className="flex items-start gap-3">
											<span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
											<div>
												<p className="text-base font-medium text-gray-900">
													{meeting.title || "Lesson"}
												</p>
												<p className="text-sm text-gray-600">
													{meeting.student
														? `${meeting.student.firstName} ${meeting.student.lastName}`
														: "Unassigned student"}
												</p>
											</div>
										</div>
										<div className="text-right text-sm text-gray-600 whitespace-nowrap">
											<p>{formatEventDate(start)}</p>
											<p>
												{formatTime(start)} – {formatTime(end)}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						<div className="text-center py-6 text-sm text-gray-500">
							<p className="mb-3">No upcoming lessons scheduled.</p>
							<a
								href="/schedule"
								className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors"
							>
								Schedule a lesson
							</a>
						</div>
					)}
				</AnalyticsCard>

				<AnalyticsCard title="Past Lessons">
					{pastMeetings.length > 0 ? (
						<ul className="divide-y divide-gray-100">
							{pastMeetings.map((meeting) => {
								const start = new Date(meeting.startTime);
								const end = new Date(meeting.endTime);
								const isCompleted = meeting.isCompleted;
								return (
									<li key={meeting.id} className="py-2.5 flex items-start justify-between gap-3">
										<div className="flex items-start gap-3">
											<span
												className={`mt-1 h-2.5 w-2.5 rounded-full ${
													isCompleted ? "bg-emerald-400" : "bg-amber-400"
												}`}
											/>
											<div>
												<p className="text-base font-medium text-gray-900">
													{meeting.title || "Lesson"}
												</p>
												<p className="text-sm text-gray-600">
													{meeting.student
														? `${meeting.student.firstName} ${meeting.student.lastName}`
														: "Unassigned student"}
												</p>
											</div>
										</div>
										<div className="text-right text-sm text-gray-600 whitespace-nowrap">
											<p>{formatEventDate(start)}</p>
											<p>
												{formatTime(start)} – {formatTime(end)}
											</p>
											<p className="mt-0.5">
												<span
													className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
														isCompleted
															? "bg-emerald-50 text-emerald-700"
															: "bg-amber-50 text-amber-700"
													}`}
												>
													{isCompleted ? "Completed" : "Not marked complete"}
												</span>
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					) : (
						<div className="text-center py-6 text-sm text-gray-500">
							<p>No recent lessons in the last 30 days.</p>
						</div>
					)}
				</AnalyticsCard>
			</div>
		</div>
	);
}
