"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NiceDatePicker from "@/app/components/NiceDatePicker";
import NiceTimePicker from "@/app/components/NiceTimePicker";

const STATUS_OPTIONS = [
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "MISSED", label: "Missed" },
	{ value: "CANCELLED", label: "Cancelled" },
] as const;

interface InitialData {
	id: string;
	scheduledDate: string;
	scheduledTime: string;
	status: string;
	notes: string;
	studentName: string;
}

interface CheckinEditClientProps {
	checkInId: string;
	initial: InitialData;
}

export default function CheckinEditClient({
	checkInId,
	initial,
}: CheckinEditClientProps) {
	const router = useRouter();
	const [scheduledDate, setScheduledDate] = useState(initial.scheduledDate);
	const [scheduledTime, setScheduledTime] = useState(initial.scheduledTime);
	const [status, setStatus] = useState(initial.status);
	const [notes, setNotes] = useState(initial.notes);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			const body: Record<string, unknown> = {
				status,
				notes: notes || null,
				scheduledDate: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
			};
			if (status === "COMPLETED") {
				body.completedDate = new Date().toISOString();
			}
			const res = await fetch(`/api/checkins/${checkInId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Failed to update");
			}
			router.push(`/calendar/event/checkin/${checkInId}`);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => router.push(`/calendar/event/checkin/${checkInId}`)}
							className="text-gray-400 hover:text-gray-600 p-1"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<h1 className="text-2xl font-semibold text-[#3D4756]">Edit Event</h1>
					</div>
					<button
						type="submit"
						form="checkin-edit-form"
						disabled={saving}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
					>
						{saving ? "Saving…" : "Save"}
					</button>
				</div>

				<div className="bg-white rounded-2xl shadow-xl p-6">
					<form id="checkin-edit-form" onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
						)}

						<div>
							<input
								type="text"
								value={`Check-in: ${initial.studentName}`}
								readOnly
								className="w-full text-2xl font-medium border-none outline-none text-gray-900 bg-transparent"
							/>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-600">Type</span>
							<div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
								<span className="px-3 py-1 text-gray-600 cursor-default">Lesson</span>
								<span className="px-3 py-1 rounded-full font-medium bg-white text-gray-900 shadow-sm">
									Check-in
								</span>
								<span className="px-3 py-1 text-gray-600 cursor-default">Event</span>
							</div>
						</div>

						<div className="flex items-center gap-4 flex-wrap">
							<div className="flex items-center">
								<NiceDatePicker
									name="scheduledDate"
									value={scheduledDate}
									onChange={setScheduledDate}
								/>
							</div>
							<div className="flex items-center gap-2 min-w-[140px]">
								<NiceTimePicker
									name="scheduledTime"
									value={scheduledTime}
									onChange={setScheduledTime}
								/>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							<div className="flex-1">
								<div className="text-sm text-gray-500 mb-1">Student</div>
								<div className="text-sm font-medium text-gray-900">{initial.studentName}</div>
							</div>
						</div>

						<div>
							<label htmlFor="status" className="block text-sm text-gray-600 mb-1.5">
								Status
							</label>
							<select
								id="status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
							>
								{STATUS_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
								</svg>
								<span className="text-sm text-gray-600">Notes</span>
							</div>
							<textarea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={4}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
								placeholder="Add notes for this check-in..."
							/>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
