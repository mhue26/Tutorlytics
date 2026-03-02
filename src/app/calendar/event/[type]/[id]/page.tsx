import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonStatusActions from "./LessonStatusActions";

const VALID_TYPES = ["lesson", "checkin", "keydate"] as const;
type EventType = (typeof VALID_TYPES)[number];

function formatDate(d: Date) {
	return new Date(d).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}
function formatTime(d: Date) {
	return new Date(d).toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getLessonStatusPillClass(status: string): string {
	switch (status) {
		case "IN_PROGRESS":
			return "bg-amber-50 text-amber-700";
		case "CANCELLED":
			return "bg-red-50 text-red-700";
		case "NEEDS_REVIEW":
			return "bg-purple-50 text-purple-700";
		case "COMPLETED":
			return "bg-emerald-50 text-emerald-700";
		default:
			return "bg-blue-50 text-blue-700";
	}
}

export default async function CalendarEventDetailPage({
	params,
}: {
	params: Promise<{ type: string; id: string }>;
}) {
	const { type, id } = await params;
	if (!VALID_TYPES.includes(type as EventType)) notFound();

	const ctx = await requireOrgContext();

	if (type === "lesson") {
		const meetingId = parseInt(id, 10);
		if (Number.isNaN(meetingId)) notFound();
		const meetingWhere: { id: number; organisationId: string; createdById?: string } = {
			id: meetingId,
			organisationId: ctx.organisationId,
		};
		if (ctx.role === "TEACHER") meetingWhere.createdById = ctx.userId;

		const meeting = await prisma.meeting.findFirst({
			where: meetingWhere,
			include: { student: true },
		});
		if (!meeting) notFound();

		const seriesCount =
			meeting.recurrenceSeriesId != null
				? await prisma.meeting.count({
						where: { recurrenceSeriesId: meeting.recurrenceSeriesId },
					})
				: null;
		const effectiveStatus =
			meeting.status === "IN_PROGRESS" && new Date(meeting.endTime).getTime() < Date.now()
				? "NEEDS_REVIEW"
				: meeting.status;

		return (
			<div className="max-w-2xl mx-auto p-6 sm:p-8">
				<Link
					href="/calendar"
					className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block mb-2"
				>
					← Back to Calendar
				</Link>
				<div className="mt-4 border border-gray-200 rounded-xl p-6 sm:p-8 bg-white shadow-sm">
					<div className="mb-6 pb-6 border-b border-gray-100">
						<h1 className="text-2xl font-semibold text-gray-900">{meeting.title}</h1>
						{meeting.recurrenceSeriesId != null && (
							<span className="inline-block mt-3 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
								Part of recurring series
								{seriesCount != null && meeting.recurrenceIndex != null
									? ` (event ${meeting.recurrenceIndex + 1} of ${seriesCount})`
									: ""}
							</span>
						)}
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm mb-8">
						<div>
							<div className="text-gray-500 mb-1.5">Date</div>
							<div className="font-medium text-gray-900">{formatDate(meeting.startTime)}</div>
						</div>
						<div>
							<div className="text-gray-500 mb-1.5">Time</div>
							<div className="font-medium text-gray-900">
								{formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
							</div>
						</div>
						<div>
							<div className="text-gray-500 mb-1.5">Student</div>
							<div className="font-medium text-gray-900">
								{meeting.student.firstName} {meeting.student.lastName}
							</div>
						</div>
						{meeting.meetingLocation && (
							<div>
								<div className="text-gray-500 mb-1.5">Location</div>
								<div className="font-medium text-gray-900">{meeting.meetingLocation}</div>
							</div>
						)}
						<div>
							<div className="text-gray-500 mb-1.5">Status</div>
							<span
								className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getLessonStatusPillClass(
									effectiveStatus
								)}`}
							>
								{effectiveStatus.replace("_", " ")}
							</span>
						</div>
						{meeting.description && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Description</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{meeting.description}</div>
							</div>
						)}
						{meeting.lessonPlan && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Lesson plan</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{meeting.lessonPlan}</div>
							</div>
						)}
						{meeting.homework && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Homework</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{meeting.homework}</div>
							</div>
						)}
						{meeting.lessonSummary && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Lesson summary</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{meeting.lessonSummary}</div>
							</div>
						)}
						{meeting.nextLessonPrep && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Next lesson prep</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{meeting.nextLessonPrep}</div>
							</div>
						)}
					</div>

					<LessonStatusActions
						meetingId={meeting.id}
						status={
							effectiveStatus as
								| "SCHEDULED"
								| "IN_PROGRESS"
								| "CANCELLED"
								| "NEEDS_REVIEW"
								| "COMPLETED"
						}
					/>
				</div>
			</div>
		);
	}

	if (type === "checkin") {
		const checkInWhere: { id: string; organisationId: string; teacherId?: string } = {
			id,
			organisationId: ctx.organisationId,
		};
		if (ctx.role === "TEACHER") checkInWhere.teacherId = ctx.userId;

		const checkIn = await prisma.checkIn.findFirst({
			where: checkInWhere,
			include: {
				student: { select: { id: true, firstName: true, lastName: true } },
			},
		});
		if (!checkIn) notFound();

		return (
			<div className="max-w-2xl mx-auto p-6 sm:p-8">
				<Link
					href="/calendar"
					className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block mb-2"
				>
					← Back to Calendar
				</Link>
				<div className="mt-4 border border-gray-200 rounded-xl p-6 sm:p-8 bg-white shadow-sm">
					<div className="mb-6 pb-6 border-b border-gray-100">
						<h1 className="text-2xl font-semibold text-gray-900">
							Check-in: {checkIn.student?.firstName} {checkIn.student?.lastName}
						</h1>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm mb-8">
						<div>
							<div className="text-gray-500 mb-1.5">Date</div>
							<div className="font-medium text-gray-900">{formatDate(checkIn.scheduledDate)}</div>
						</div>
						<div>
							<div className="text-gray-500 mb-1.5">Status</div>
							<div className="font-medium text-gray-900">{checkIn.status}</div>
						</div>
						{checkIn.notes && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Notes</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{checkIn.notes}</div>
							</div>
						)}
					</div>
					
					<div className="flex items-center gap-3 pt-4">
						<Link
							href={`/calendar/event/checkin/${checkIn.id}/edit`}
							className="px-5 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] font-medium text-sm transition-colors"
						>
							Edit
						</Link>
						<Link
							href="/calendar"
							className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm transition-colors"
						>
							Back to calendar
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// keydate
	const keyDate = await prisma.keyDate.findFirst({
		where: { id, organisationId: ctx.organisationId },
		include: { class: true },
	});
	if (!keyDate) notFound();

	return (
		<div className="max-w-2xl mx-auto p-6 sm:p-8">
			<Link
				href="/calendar"
				className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block mb-2"
			>
				← Back to Calendar
			</Link>
				<div className="mt-4 border border-gray-200 rounded-xl p-6 sm:p-8 bg-white shadow-sm">
					<div className="mb-6 pb-6 border-b border-gray-100">
						<h1 className="text-2xl font-semibold text-gray-900">{keyDate.title}</h1>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm mb-8">
						<div>
							<div className="text-gray-500 mb-1.5">Date</div>
							<div className="font-medium text-gray-900">{formatDate(keyDate.date)}</div>
						</div>
						<div>
							<div className="text-gray-500 mb-1.5">Scope</div>
							<div className="font-medium text-gray-900">{keyDate.scope}</div>
						</div>
						{keyDate.class && (
							<div>
								<div className="text-gray-500 mb-1.5">Class</div>
								<div className="font-medium text-gray-900">{keyDate.class.name}</div>
							</div>
						)}
						{keyDate.description && (
							<div className="sm:col-span-2">
								<div className="text-gray-500 mb-1.5">Description</div>
								<div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{keyDate.description}</div>
							</div>
						)}
					</div>
					
					<div className="flex items-center gap-3 pt-4">
						<Link
							href={`/calendar/event/keydate/${keyDate.id}/edit`}
							className="px-5 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] font-medium text-sm transition-colors"
						>
							Edit
						</Link>
						<Link
							href="/calendar"
							className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm transition-colors"
						>
							Back to calendar
						</Link>
					</div>
				</div>
		</div>
	);
}
