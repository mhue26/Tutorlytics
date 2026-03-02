import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";
import NiceDatePicker from "@/app/components/NiceDatePicker";
import NiceTimePicker from "@/app/components/NiceTimePicker";
import { createMeeting } from "../actions";
import RepeatOptionsBlock from "../RepeatOptionsBlock";

export default async function NewMeetingPage() {
	const ctx = await requireOrgContext();

	const [students, terms] = await Promise.all([
		prisma.student.findMany({
			where: { organisationId: ctx.organisationId, isArchived: false },
			orderBy: { firstName: "asc" },
		}),
		prisma.term.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: [{ year: "desc" }, { startDate: "asc" }],
		}),
	]);

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="mb-6">
				<Link href="/calendar" className="text-blue-600 hover:text-blue-800 text-sm font-medium">← Back to Calendar</Link>
				<h1 className="text-2xl font-bold text-gray-900 mt-2">Schedule</h1>
			</div>

			<form action={createMeeting} className="space-y-6">
				<input type="hidden" name="redirect" value="true" />
				<div>
					<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Meeting Title *</label>
					<input type="text" id="title" name="title" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Piano Lesson, Math Tutoring" />
				</div>

				<div>
					<label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">Student *</label>
					<select id="studentId" name="studentId" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="">Select a student</option>
						{students.map((student) => (
							<option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="meetingDate" className="block text-sm font-medium text-gray-700 mb-2">Meeting Date *</label>
					<NiceDatePicker
						name="meetingDate"
						initialValue={new Date().toISOString().split("T")[0]}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
						<NiceTimePicker name="startTime" />
					</div>
					<div>
						<label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
						<NiceTimePicker name="endTime" />
					</div>
				</div>

				<div className="mt-3">
					<RepeatOptionsBlock terms={terms} />
				</div>

				<div>
					<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
					<textarea id="description" name="description" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes about this meeting..." />
				</div>

				<div className="flex items-center">
					<input type="checkbox" id="isCompleted" name="isCompleted" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
					<label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-700">Mark as completed</label>
				</div>

				<div className="flex gap-4">
					<button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Create Meeting</button>
					<Link href="/calendar" className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">Cancel</Link>
				</div>
			</form>
		</div>
	);
}
