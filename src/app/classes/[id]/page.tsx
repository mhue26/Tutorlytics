import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";

export default async function ClassDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: idParam } = await params;
	const classId = parseInt(idParam, 10);
	if (Number.isNaN(classId)) notFound();

	const ctx = await requireOrgContext();

	const classRecord = await prisma.class.findFirst({
		where: { id: classId, organisationId: ctx.organisationId },
		include: {
			students: {
				where: { isArchived: false },
				select: { id: true, firstName: true, lastName: true },
			},
			classSessions: {
				orderBy: { startTime: "asc" },
				include: {
					attendanceRecords: true,
				},
			},
		},
	});

	if (!classRecord) notFound();

	const createdDate = new Date(classRecord.createdAt).toLocaleDateString();

	const now = new Date();
	const upcomingSessions =
		classRecord.classSessions.filter(
			(session) => new Date(session.startTime) >= now,
		);
	const pastSessions = classRecord.classSessions.filter(
		(session) => new Date(session.startTime) < now,
	);

	const nextSession =
		upcomingSessions.length > 0 ? upcomingSessions[0] : null;

	return (
		<div className="space-y-6 pt-8">
			<div className="flex items-center gap-4">
				<Link
					href="/classes"
					className="text-gray-600 hover:text-gray-800"
				>
					← Back to Classes
				</Link>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="flex items-center gap-3 mb-2">
					<div
						className="w-4 h-4 rounded-full shrink-0"
						style={{ backgroundColor: classRecord.color }}
					/>
					<div className="flex items-center justify-between w-full">
						<h1 className="text-2xl font-semibold text-gray-900">
							{classRecord.name}
						</h1>
						<Link
							href={`/classes/${classRecord.id}/schedule`}
							className="ml-auto inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors"
						>
							Schedule recurring lessons
						</Link>
					</div>
				</div>
				{classRecord.description && (
					<p className="text-gray-600 text-sm mb-4 pl-7">
						{classRecord.description}
					</p>
				)}
				<div className="flex flex-wrap gap-4 text-sm text-gray-500 pl-7">
					<span>
						{classRecord.students.length} student
						{classRecord.students.length !== 1 ? "s" : ""}
					</span>
					<span>Created {createdDate}</span>
					{nextSession && (
						<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								Next class:{" "}
								{new Date(
									nextSession.startTime,
								).toLocaleString("en-GB", {
									weekday: "short",
									day: "numeric",
									month: "short",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</span>
					)}
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Students
				</h2>
				{classRecord.students.length === 0 ? (
					<p className="text-gray-500 text-sm">
						No students in this class.
					</p>
				) : (
					<ul className="divide-y divide-gray-200">
						{classRecord.students.map((student) => (
							<li
								key={student.id}
								className="py-2 first:pt-0 last:pb-0"
							>
								<Link
									href={`/students/${student.id}`}
									className="text-gray-900 hover:text-blue-700 hover:underline"
								>
									{student.firstName} {student.lastName}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>

			{pastSessions.length > 0 && classRecord.students.length > 0 && (
				<div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Attendance
					</h2>
					<div className="min-w-full">
						<table className="min-w-full text-sm border-collapse">
							<thead>
								<tr>
									<th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600">
										Student
									</th>
									{pastSessions.map((session) => (
										<th
											key={session.id}
											className="border-b border-gray-200 px-4 py-2 text-xs text-gray-600 text-center whitespace-nowrap"
										>
											<div>
												{new Date(
													session.startTime,
												).toLocaleDateString(
													"en-GB",
													{
														month: "short",
														day: "numeric",
													},
												)}
											</div>
											<Link
												href={`/classes/sessions/${session.id}/attendance`}
												className="mt-1 inline-block text-[10px] text-blue-600 hover:underline"
											>
												Edit
											</Link>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{classRecord.students.map((student) => (
									<tr key={student.id}>
										<td className="border-b border-gray-100 px-4 py-2 text-gray-900 whitespace-nowrap">
											{student.firstName}{" "}
											{student.lastName}
										</td>
										{pastSessions.map((session) => {
											const record =
												session.attendanceRecords.find(
													(r: any) =>
														r.studentId ===
														student.id,
												);
											let label = "—";
											let colorClass =
												"text-gray-400";
											if (record) {
												if (
													record.status ===
													"PRESENT"
												) {
													label = "P";
													colorClass =
														"text-green-600";
												} else if (
													record.status === "ABSENT"
												) {
													label = "A";
													colorClass =
														"text-red-600";
												} else if (
													record.status === "LATE"
												) {
													label = "L";
													colorClass =
														"text-yellow-700";
												}
											}
											return (
												<td
													key={session.id}
													className="border-b border-gray-100 px-4 py-2 text-center"
												>
													<span
														className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${colorClass}`}
													>
														{label}
													</span>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
						<p className="mt-3 text-xs text-gray-400">
							P = Present, A = Absent, L = Late
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
