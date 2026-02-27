import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import NiceTimePicker from "@/app/components/NiceTimePicker";

async function createClassSessions(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();

	const classId = parseInt(String(formData.get("classId") || ""), 10);
	const termId = parseInt(String(formData.get("termId") || ""), 10);
	const title = String(formData.get("title") || "").trim();
	const description =
		String(formData.get("description") || "").trim() || null;
	const firstDate = String(formData.get("firstDate") || "").trim();
	const startTime = String(formData.get("startTime") || "").trim();
	const endTime = String(formData.get("endTime") || "").trim();
	const recurrence = String(formData.get("recurrence") || "weekly");
	const lessonCount = parseInt(
		String(formData.get("lessonCount") || "0"),
		10,
	);

	if (
		!classId ||
		!termId ||
		!title ||
		!firstDate ||
		!startTime ||
		!endTime ||
		!lessonCount ||
		lessonCount <= 0
	) {
		throw new Error("All required fields must be filled");
	}

	const classRecord = await prisma.class.findFirst({
		where: { id: classId, organisationId: ctx.organisationId },
	});
	if (!classRecord) {
		throw new Error("Class not found");
	}

	const term = await prisma.term.findFirst({
		where: { id: termId, organisationId: ctx.organisationId },
	});
	if (!term) {
		throw new Error("Term not found");
	}

	const termStart = new Date(term.startDate);
	const termEnd = new Date(term.endDate);

	const baseStart = new Date(`${firstDate}T${startTime}`);
	const baseEnd = new Date(`${firstDate}T${endTime}`);

	if (baseStart > termEnd || baseEnd > termEnd) {
		throw new Error("First lesson must be within the selected term");
	}

	const dayMs = 24 * 60 * 60 * 1000;
	const intervalDays = recurrence === "biweekly" ? 14 : 7;

	const sessionsData = [];
	let occurrences = 0;
	let offset = 0;

	while (occurrences < lessonCount) {
		const start = new Date(baseStart.getTime() + offset * dayMs);
		const end = new Date(baseEnd.getTime() + offset * dayMs);

		if (start > termEnd || end > termEnd) {
			break;
		}

		if (start >= termStart) {
			sessionsData.push({
				title,
				description,
				startTime: start,
				endTime: end,
				organisationId: ctx.organisationId,
				classId: classRecord.id,
				createdById: ctx.userId,
			});
			occurrences += 1;
		}

		offset += intervalDays;
	}

	if (sessionsData.length === 0) {
		throw new Error(
			"Could not create any sessions within the selected term and lesson count",
		);
	}

	await prisma.classSession.createMany({
		data: sessionsData,
	});

	redirect(`/classes/${classRecord.id}`);
}

export default async function ClassSchedulePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const ctx = await requireOrgContext();
	const { id: idParam } = await params;
	const classId = parseInt(idParam, 10);

	if (Number.isNaN(classId)) {
		redirect("/classes");
	}

	const [classRecord, terms] = await Promise.all([
		prisma.class.findFirst({
			where: { id: classId, organisationId: ctx.organisationId },
		}),
		prisma.term.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: { startDate: "asc" },
		}),
	]);

	if (!classRecord) {
		redirect("/classes");
	}

	return (
		<div className="space-y-6 pt-8">
			<div className="flex items-center gap-4">
				<Link
					href={`/classes/${classRecord.id}`}
					className="text-gray-600 hover:text-gray-800"
				>
					← Back to Class
				</Link>
				<h1 className="text-2xl font-semibold text-[#3D4756]">
					Schedule Recurring Lessons
				</h1>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
				<form action={createClassSessions} className="space-y-6">
					<input type="hidden" name="classId" value={classRecord.id} />

					<div>
						<label className="block text-sm text-gray-700 mb-2">
							Title
						</label>
						<input
							name="title"
							type="text"
							defaultValue={classRecord.name}
							required
							className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm"
						/>
					</div>

					<div>
						<label className="block text-sm text-gray-700 mb-2">
							Description (optional)
						</label>
						<textarea
							name="description"
							rows={3}
							className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm resize-none"
							placeholder="e.g. Weekly maths lesson for Term 1"
						/>
					</div>

					<div>
						<label className="block text-sm text-gray-700 mb-2">
							Term
						</label>
						<select
							name="termId"
							required
							className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm"
						>
							<option value="">Select term…</option>
							{terms.map((term) => (
								<option key={term.id} value={term.id}>
									{term.name}{" "}
									{new Date(
										term.startDate,
									).toLocaleDateString("en-GB")}{" "}
									–{" "}
									{new Date(
										term.endDate,
									).toLocaleDateString("en-GB")}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm text-gray-700 mb-2">
								First lesson date
							</label>
							<input
								name="firstDate"
								type="date"
								required
								className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-2">
								Start time
							</label>
							<NiceTimePicker name="startTime" />
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-2">
								End time
							</label>
							<NiceTimePicker name="endTime" />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-700 mb-2">
								Recurrence
							</label>
							<select
								name="recurrence"
								defaultValue="weekly"
								className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm"
							>
								<option value="weekly">Weekly</option>
								<option value="biweekly">Every 2 weeks</option>
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-700 mb-2">
								Number of lessons in term
							</label>
							<input
								name="lessonCount"
								type="number"
								min={1}
								required
								className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] text-sm"
							/>
						</div>
					</div>

					<div className="flex gap-4 pt-2">
						<button
							type="submit"
							className="bg-[#3D4756] text-white px-4 py-2 rounded-md hover:bg-[#2A3441] transition-colors text-sm font-medium"
						>
							Create lessons
						</button>
						<Link
							href={`/classes/${classRecord.id}`}
							className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
						>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

