"use client";

import { useState, useEffect } from "react";

interface CheckIn {
	id: string;
	scheduledDate: string;
	completedDate: string | null;
	status: string;
	notes: string | null;
}

export default function CheckInsSection({ studentId }: { studentId: number }) {
	const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [formDate, setFormDate] = useState("");
	const [formNotes, setFormNotes] = useState("");
	const [loading, setLoading] = useState(false);

	const loadCheckIns = async () => {
		const res = await fetch(`/api/checkins?studentId=${studentId}`);
		if (res.ok) setCheckIns(await res.json());
	};

	useEffect(() => {
		loadCheckIns();
	}, [studentId]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		await fetch("/api/checkins", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ studentId, scheduledDate: formDate, notes: formNotes }),
		});
		setFormDate("");
		setFormNotes("");
		setShowForm(false);
		setLoading(false);
		loadCheckIns();
	};

	const handleStatusChange = async (id: string, status: string) => {
		await fetch(`/api/checkins/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
		loadCheckIns();
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this check-in?")) return;
		await fetch(`/api/checkins/${id}`, { method: "DELETE" });
		loadCheckIns();
	};

	const upcoming = checkIns.filter((c) => c.status === "SCHEDULED");
	const past = checkIns.filter((c) => c.status !== "SCHEDULED");

	const statusBadge = (status: string) => {
		const colors: Record<string, string> = {
			SCHEDULED: "bg-blue-100 text-blue-800",
			COMPLETED: "bg-green-100 text-green-800",
			MISSED: "bg-red-100 text-red-800",
			CANCELLED: "bg-gray-100 text-gray-800",
		};
		return colors[status] || "bg-gray-100 text-gray-800";
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-medium">Check-Ins</h3>
				<button
					onClick={() => setShowForm(!showForm)}
					className="text-sm bg-[#3D4756] text-white px-3 py-1.5 rounded-lg hover:bg-[#2A3441] transition-colors"
				>
					+ Schedule
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleCreate} className="mb-4 p-3 bg-gray-50 rounded-xl space-y-3">
					<input
						type="datetime-local"
						value={formDate}
						onChange={(e) => setFormDate(e.target.value)}
						required
						className="w-full border rounded-lg px-3 py-2 text-sm"
					/>
					<input
						type="text"
						placeholder="Notes (optional)"
						value={formNotes}
						onChange={(e) => setFormNotes(e.target.value)}
						className="w-full border rounded-lg px-3 py-2 text-sm"
					/>
					<div className="flex gap-2">
						<button
							type="submit"
							disabled={loading}
							className="text-sm bg-[#3D4756] text-white px-3 py-1.5 rounded-lg hover:bg-[#2A3441] disabled:opacity-50"
						>
							{loading ? "Saving..." : "Save"}
						</button>
						<button
							type="button"
							onClick={() => setShowForm(false)}
							className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{upcoming.length > 0 && (
				<div className="mb-4">
					<h4 className="text-sm font-medium text-gray-500 mb-2">Upcoming</h4>
					<div className="space-y-2">
						{upcoming.map((ci) => (
							<div key={ci.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
								<div>
									<div className="text-sm font-medium">
										{new Date(ci.scheduledDate).toLocaleDateString("en-GB", {
											weekday: "short",
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
									{ci.notes && <div className="text-xs text-gray-500">{ci.notes}</div>}
								</div>
								<div className="flex items-center gap-1">
									<button
										onClick={() => handleStatusChange(ci.id, "COMPLETED")}
										className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
										title="Mark completed"
									>
										Done
									</button>
									<button
										onClick={() => handleStatusChange(ci.id, "MISSED")}
										className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
										title="Mark missed"
									>
										Missed
									</button>
									<button
										onClick={() => handleDelete(ci.id)}
										className="text-xs text-gray-400 px-1 hover:text-red-500"
									>
										×
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{past.length > 0 && (
				<div>
					<h4 className="text-sm font-medium text-gray-500 mb-2">History</h4>
					<div className="space-y-1">
						{past.slice(0, 10).map((ci) => (
							<div key={ci.id} className="flex items-center justify-between p-2 rounded-lg">
								<div className="flex items-center gap-2">
									<span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusBadge(ci.status)}`}>
										{ci.status}
									</span>
									<span className="text-sm text-gray-600">
										{new Date(ci.scheduledDate).toLocaleDateString("en-GB", {
											day: "numeric",
											month: "short",
										})}
									</span>
									{ci.notes && <span className="text-xs text-gray-400">{ci.notes}</span>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{checkIns.length === 0 && (
				<p className="text-sm text-gray-400 text-center py-4">No check-ins scheduled yet.</p>
			)}
		</div>
	);
}
