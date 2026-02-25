import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function saveAttendance(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();

	const sessionId = parseInt(String(formData.get("sessionId") || ""), 10);
	if (!sessionId) {
		throw new Error("Invalid session");
	}

	const session = await prisma.classSession.findFirst({
		where: { id: sessionId, organisationId: ctx.organisationId },
		include: {
			class: {
				include: {
					students: {
						where: { isArchived: false },
						select: { id: true },
					},
				},
			},
		},
	});

	if (!session) {
		throw new Error("Session not found");
	}

	const entries: { studentId: number; status: string }[] = [];
	for (const student of session.class.students) {
		const key = `status_${student.id}`;
		const raw = String(formData.get(key) || "").trim();
		if (!raw) continue;
		entries.push({ studentId: student.id, status: raw });
	}

	for (const entry of entries) {
		await prisma.classSessionAttendance.upsert({
			where: {
				classSessionId_studentId: {
					classSessionId: session.id,
					studentId: entry.studentId,
				},
			},
			update: {
				status: entry.status as any,
			},
			create: {
				status: entry.status as any,
				classSessionId: session.id,
				studentId: entry.studentId,
				organisationId: ctx.organisationId,
			},
		});
	}

	redirect(`/classes/${session.classId}`);
}

export default async function ClassSessionAttendancePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const ctx = await requireOrgContext();
	const { id: idParam } = await params;
	const sessionId = parseInt(idParam, 10);

	if (Number.isNaN(sessionId)) {
		redirect("/classes");
	}

	const session = await prisma.classSession.findFirst({
		where: { id: sessionId, organisationId: ctx.organisationId },
		include: {
			class: {
				include: {
					students: {
						where: { isArchived: false },
						select: {
							id: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			},
			attendanceRecords: true,
		},
	});

	if (!session) {
		redirect("/classes");
	}

	const existingByStudent = new Map<
		number,
		{ status: string | null }
	>();
	for (const record of session.attendanceRecords) {
		existingByStudent.set(record.studentId, { status: record.status });
	}

	const sessionDate = new Date(session.startTime).toLocaleDateString(
		"en-GB",
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<div className="space-y-6 pt-8">
			<div className="flex items-center gap-4">
				<Link
					href={`/classes/${session.classId}`}
					className="text-gray-600 hover:text-gray-800"
				>
					← Back to Class
				</Link>
				<h1 className="text-2xl font-semibold text-[#3D4756]">
					Take attendance
				</h1>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="mb-4">
					<div className="flex items-center gap-2 mb-1">
						<div
							className="w-4 h-4 rounded-full"
							style={{ backgroundColor: session.class.color }}
						/>
						<h2 className="text-lg font-medium text-gray-900">
							{session.title || session.class.name}
						</h2>
					</div>
					<p className="text-sm text-gray-500">
						{sessionDate} •{" "}
						{new Date(session.startTime).toLocaleTimeString(
							"en-GB",
							{
								hour: "2-digit",
								minute: "2-digit",
							},
						)}{" "}
						–{" "}
						{new Date(session.endTime).toLocaleTimeString(
							"en-GB",
							{
								hour: "2-digit",
								minute: "2-digit",
							},
						)}
					</p>
				</div>

				<form action={saveAttendance} className="space-y-4">
					<input type="hidden" name="sessionId" value={session.id} />
					<table className="min-w-full divide-y divide-gray-200 text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left font-medium text-gray-600">
									Student
								</th>
								<th className="px-4 py-2 text-left font-medium text-gray-600">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{session.class.students.map((student) => {
								const existing = existingByStudent.get(
									student.id,
								);
								const defaultStatus = existing?.status || "";
								return (
									<tr key={student.id} className="hover:bg-gray-50">
										<td className="px-4 py-2">
											{student.firstName}{" "}
											{student.lastName}
										</td>
										<td className="px-4 py-2">
											<select
												name={`status_${student.id}`}
												defaultValue={defaultStatus}
												className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
											>
												<option value="">
													Not set
												</option>
												<option value="PRESENT">
													Present
												</option>
												<option value="ABSENT">
													Absent
												</option>
												<option value="LATE">
													Late
												</option>
											</select>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<div className="flex justify-end gap-3 pt-4">
						<Link
							href={`/classes/${session.classId}`}
							className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition-colors"
						>
							Cancel
						</Link>
						<button
							type="submit"
							className="px-4 py-2 rounded-md bg-[#3D4756] text-white text-sm font-medium hover:bg-[#2A3441] transition-colors"
						>
							Save attendance
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

