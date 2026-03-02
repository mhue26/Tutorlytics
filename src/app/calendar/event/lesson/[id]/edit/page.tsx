import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { notFound } from "next/navigation";
import LessonEditClient from "./LessonEditClient";

const ONLINE_PLATFORMS = ["Zoom", "Google Meet", "Microsoft Teams", "Webex"];

function toDateString(d: Date): string {
	const x = new Date(d);
	const y = x.getFullYear();
	const m = `${x.getMonth() + 1}`.padStart(2, "0");
	const day = `${x.getDate()}`.padStart(2, "0");
	return `${y}-${m}-${day}`;
}
function toTimeString(d: Date): string {
	const x = new Date(d);
	const h = `${x.getHours()}`.padStart(2, "0");
	const min = `${x.getMinutes()}`.padStart(2, "0");
	return `${h}:${min}`;
}

function parseLessonSubjects(description: string | null): string {
	if (!description || !description.trim()) return "";
	const match = description.match(/^Subjects:\s*(.+)$/im);
	return match ? match[1].trim() : "";
}

function inferLocation(
	meetingLocation: string | null
): { locationMode: "in-person" | "online" | null; locationAddress: string; locationPlatform: string } {
	if (!meetingLocation || !meetingLocation.trim()) {
		return { locationMode: null, locationAddress: "", locationPlatform: "" };
	}
	const loc = meetingLocation.trim();
	if (ONLINE_PLATFORMS.includes(loc)) {
		return { locationMode: "online", locationAddress: "", locationPlatform: loc };
	}
	return { locationMode: "in-person", locationAddress: loc, locationPlatform: "" };
}

export default async function LessonEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const meetingId = parseInt(id, 10);
	if (Number.isNaN(meetingId)) notFound();

	const ctx = await requireOrgContext();
	const where: { id: number; organisationId: string; createdById?: string } = {
		id: meetingId,
		organisationId: ctx.organisationId,
	};
	if (ctx.role === "TEACHER") where.createdById = ctx.userId;

	const [meeting, students] = await Promise.all([
		prisma.meeting.findFirst({
			where,
			include: { student: true },
		}),
		prisma.student.findMany({
			where: { organisationId: ctx.organisationId, isArchived: false },
			orderBy: { firstName: "asc" },
			select: { id: true, firstName: true, lastName: true, year: true, subjects: true },
		}),
	]);

	if (!meeting) notFound();

	const location = inferLocation(meeting.meetingLocation ?? null);
	const description = meeting.description ?? "";
	const lessonSubjects = parseLessonSubjects(description);

	const initial = {
		id: meeting.id,
		title: meeting.title,
		description,
		studentId: String(meeting.studentId),
		meetingDate: toDateString(meeting.startTime),
		startTime: toTimeString(meeting.startTime),
		endTime: toTimeString(meeting.endTime),
		isCompleted: meeting.isCompleted,
		meetingLocation: meeting.meetingLocation ?? "",
		lessonSubjects,
		status:
			meeting.status === "IN_PROGRESS" && new Date(meeting.endTime).getTime() < Date.now()
				? ("NEEDS_REVIEW" as const)
				: meeting.status,
		lessonPlan: meeting.lessonPlan ?? "",
		homework: meeting.homework ?? "",
		lessonSummary: meeting.lessonSummary ?? "",
		nextLessonPrep: meeting.nextLessonPrep ?? "",
		cancelReason: meeting.cancelReason ?? "",
		locationMode: location.locationMode,
		locationAddress: location.locationAddress,
		locationPlatform: location.locationPlatform,
		recurrenceSeriesId: meeting.recurrenceSeriesId,
		recurrenceIndex: meeting.recurrenceIndex,
	};

	return <LessonEditClient meetingId={meeting.id} initial={initial} students={students} />;
}
