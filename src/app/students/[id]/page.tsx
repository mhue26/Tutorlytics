import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import DeleteIcon from "./DeleteIcon";
import ArchiveIcon from "./ArchiveIcon";
import EditIcon from "./EditIcon";
import SubjectsDisplay from "../SubjectsDisplay";
import StudentTabs from "../StudentTabs";
import EditableGoals from "./EditableGoals";
import CheckInsSection from "./CheckInsSection";
import ResultsSection from "./ResultsSection";
import StudentAvatar from "../StudentAvatar";

function formatCurrencyFromCents(valueInCents: number): string {
	const dollars = (valueInCents / 100).toFixed(2);
	return `$${dollars}`;
}

async function deleteStudent(id: number) {
	"use server";
	const ctx = await requireOrgContext();
	const student = await prisma.student.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!student) return;
	await prisma.student.delete({ where: { id } });
	redirect("/students");
}

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id: idString } = await params;
	const id = Number(idString);
	if (Number.isNaN(id)) notFound();

	const ctx = await requireOrgContext();

	const student = await prisma.student.findFirst({
		where: { id, organisationId: ctx.organisationId },
		include: {
			meetings: {
				where: { startTime: { gte: new Date() }, isCompleted: false },
				orderBy: { startTime: "asc" },
				take: 1,
			},
			class: true,
		},
	});

	if (!student) notFound();

	const allMeetings = await prisma.meeting.findMany({
		where: { studentId: id, organisationId: ctx.organisationId },
		orderBy: { startTime: "desc" },
	});

	const [terms, holidays] = await Promise.all([
		prisma.term.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: { startDate: "desc" },
		}),
		prisma.holiday.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: { startDate: "desc" },
		}),
	]);

	const teachingPeriods: any[] = [
		...terms.map((term) => ({ ...term, type: "term" as const })),
		...holidays.map((holiday) => ({ ...holiday, type: "holiday" as const })),
	];

	const parseContactInfo = (phone: string | null) => {
		if (!phone) return [];
		return phone.split(" | ").map((contact) => {
			const colonIndex = contact.indexOf(": ");
			if (colonIndex > -1) {
				return { method: contact.substring(0, colonIndex), details: contact.substring(colonIndex + 2) };
			}
			return { method: "Phone", details: contact };
		});
	};

	const contactInfos = parseContactInfo(student.phone);

	const calculateTimeAgo = (date: Date) => {
		const now = new Date();
		const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays === 0) return "(today)";
		if (diffDays === 1) return "(1 day ago)";
		if (diffDays < 30) return `(${diffDays} days ago)`;
		const diffMonths = Math.floor(diffDays / 30);
		const remainingDays = diffDays % 30;
		if (diffMonths === 1) {
			if (remainingDays === 0) return "(1 month ago)";
			return `(1 month and ${remainingDays} day${remainingDays > 1 ? "s" : ""} ago)`;
		}
		if (remainingDays === 0) return `(${diffMonths} months ago)`;
		return `(${diffMonths} months and ${remainingDays} day${remainingDays > 1 ? "s" : ""} ago)`;
	};

	const timeAgo = calculateTimeAgo(new Date(student.createdAt));

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="space-y-6">
				<Link href="/students" className="text-sm text-gray-600 hover:underline cursor-pointer">← Back to Students</Link>

				<div className="flex flex-col items-center gap-3">
					<StudentAvatar
						firstName={student.firstName}
						lastName={student.lastName}
						studentId={student.id}
					/>
					<h2 className="text-2xl font-semibold">{student.firstName} {student.lastName}</h2>
					<div className="flex items-center gap-3">
						<EditIcon studentId={student.id} />
						<ArchiveIcon studentId={student.id} />
						<DeleteIcon studentId={student.id} deleteAction={deleteStudent} />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<EditableGoals studentId={student.id} initialNotes={student.notes} />
					</div>
					<div>
						{student.meetings.length > 0 ? (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full">
								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<div className="flex-1">
										<h3 className="text-sm font-medium text-blue-900 mb-1">Upcoming</h3>
										<div className="text-sm text-blue-800 space-y-2">
											<div>
												<div className="text-xs text-blue-600 font-medium">Title</div>
												<div>{student.meetings[0].title}</div>
											</div>
											<div>
												<div className="text-xs text-blue-600 font-medium">Date</div>
												<div>{new Date(student.meetings[0].startTime).toLocaleDateString("en-GB")}</div>
											</div>
											<div>
												<div className="text-xs text-blue-600 font-medium">Time</div>
												<div>
													{new Date(student.meetings[0].startTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}
													{" - "}
													{new Date(student.meetings[0].endTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full">
								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<div className="flex-1">
										<h3 className="text-sm font-medium text-blue-900 mb-1">Upcoming</h3>
										<div className="text-blue-600 italic text-sm">No upcoming events scheduled</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<CheckInsSection studentId={student.id} />
				<ResultsSection studentId={student.id} />
			</div>

			<StudentTabs
				meetings={allMeetings}
				teachingPeriods={teachingPeriods}
				studentName={`${student.firstName} ${student.lastName}`}
				studentSubjects={student.schoolSubjects || ""}
			>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="bg-white rounded-2xl shadow-sm p-6">
						<h3 className="text-lg font-medium mb-4">Student Information</h3>
						<div className="space-y-4">
							<div>
								<div className="text-sm text-gray-600">Name</div>
								<div className="font-medium">{student.firstName} {student.lastName}</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">Email</div>
								<div className="font-medium">{student.email || "—"}</div>
							</div>
							{contactInfos.length > 0 ? (
								contactInfos.map((contact, index) => (
									<div key={index}>
										<div className="text-sm text-gray-600">{contact.method}</div>
										<div className="font-medium">{contact.details}</div>
									</div>
								))
							) : (
								<div>
									<div className="text-sm text-gray-600">Contact</div>
									<div className="font-medium">—</div>
								</div>
							)}
						</div>
					</div>

					{student.parentEmail !== "N/A" && (
						<div className="bg-white rounded-2xl shadow-sm p-6">
							<h3 className="text-lg font-medium mb-4">Parent Information</h3>
							<div className="space-y-4">
								{student.parentEmail && (
									<div>
										<div className="text-sm text-gray-600">Relationship</div>
										<div className="font-medium">{student.parentEmail}</div>
									</div>
								)}
								<div>
									<div className="text-sm text-gray-600">Name</div>
									<div className="font-medium">{student.parentName || "—"}</div>
								</div>
								{student.parentPhone && (
									<div>
										<div className="text-sm text-gray-600">Preferred Contact</div>
										<div className="font-medium">{student.parentPhone}</div>
									</div>
								)}
							</div>
						</div>
					)}

					<div className="bg-white rounded-2xl shadow-sm p-6">
						<h3 className="text-lg font-medium mb-4">Academic Information</h3>
						<div className="space-y-4">
							<div>
								<div className="text-sm text-gray-600">School Subjects</div>
								<div className="font-medium">
									<SubjectsDisplay subjects={student.schoolSubjects || ""} allowColorPicker={true} />
								</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">Year Level</div>
								<div className="font-medium">{student.year ? `Year ${student.year}` : "—"}</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">School</div>
								<div className="font-medium">{student.school || "—"}</div>
							</div>
							<div>
								<div className="text-sm text-gray-600">Student Since</div>
								<div className="font-medium">{new Date(student.createdAt).toLocaleDateString("en-GB")} <span className="text-gray-500">{timeAgo}</span></div>
							</div>
							{student.class && (
								<div>
									<div className="text-sm text-gray-600">Class</div>
									<div className="font-medium flex items-center gap-2">
										<div className="w-3 h-3 rounded-full" style={{ backgroundColor: student.class.color }}></div>
										{student.class.name}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h3 className="text-lg font-medium mb-4">Lesson Information</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div>
							<div className="text-sm text-gray-600">Hourly Rate</div>
							<div className="font-medium text-lg">{formatCurrencyFromCents(student.hourlyRateCents)}</div>
						</div>
						<div>
							<div className="text-sm text-gray-600">Subjects</div>
							<div className="font-medium">
								<SubjectsDisplay subjects={student.subjects || ""} allowColorPicker={false} />
							</div>
						</div>
						<div>
							<div className="text-sm text-gray-600">Location</div>
							<div className="font-medium">{student.meetingLocation || "—"}</div>
						</div>
					</div>
				</div>
			</StudentTabs>
		</div>
	);
}
