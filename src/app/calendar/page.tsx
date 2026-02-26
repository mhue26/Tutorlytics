import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import CalendarClient from "./CalendarClient";
import { createMeeting } from "./actions";

interface CalendarSearchParams {
  month?: string;
  year?: string;
  view?: "month" | "week" | "fiveday" | "threeday" | "day";
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<CalendarSearchParams> }) {
	const ctx = await requireOrgContext();

	const params = await searchParams;
	const now = new Date();
	const currentMonth = params.month ? parseInt(params.month) - 1 : now.getMonth();
	const currentYear = params.year ? parseInt(params.year) : now.getFullYear();

	const startOfMonth = new Date(currentYear, currentMonth, 1);
	const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

	const queryStart = new Date(startOfMonth);
	queryStart.setDate(queryStart.getDate() - 7);
	const queryEnd = new Date(endOfMonth);
	queryEnd.setDate(queryEnd.getDate() + 7);

	const meetingWhere: any = {
		organisationId: ctx.organisationId,
		startTime: { gte: queryStart, lte: queryEnd },
	};
	if (ctx.role === "TEACHER") {
		meetingWhere.createdById = ctx.userId;
	}

	const meetings = await prisma.meeting.findMany({
		where: meetingWhere,
		include: { student: true },
		orderBy: { startTime: "asc" },
	});

	const upcomingStart = new Date();
	const upcomingEnd = new Date();
	upcomingEnd.setDate(upcomingEnd.getDate() + 7);

	const upcomingWhere: any = {
		organisationId: ctx.organisationId,
		startTime: { gte: upcomingStart, lte: upcomingEnd },
	};
	if (ctx.role === "TEACHER") {
		upcomingWhere.createdById = ctx.userId;
	}

	const upcomingMeetings = await prisma.meeting.findMany({
		where: upcomingWhere,
		include: { student: true },
		orderBy: { startTime: "asc" },
	});

	const students = await prisma.student.findMany({
		where: { organisationId: ctx.organisationId, isArchived: false },
		orderBy: { firstName: "asc" },
		select: { id: true, firstName: true, lastName: true },
	});

	return (
		<CalendarClient
			meetings={meetings as any}
			upcomingMeetings={upcomingMeetings as any}
			currentYear={currentYear}
			currentMonth={currentMonth}
			initialView={params.view ?? "month"}
			students={students}
			createMeeting={createMeeting}
			userId={ctx.userId}
		/>
	);
}
