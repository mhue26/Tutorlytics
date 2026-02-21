"use client";

import { useState, useEffect } from "react";

interface Assessment {
	id: string;
	type: string;
	title: string;
	score: number | null;
	maxScore: number | null;
	grade: string | null;
	notes: string | null;
	date: string;
	recordedBy: { name: string | null };
}

const ASSESSMENT_TYPES = ["Test", "Homework", "Classwork", "Exam", "Other"];

export default function ResultsSection({ studentId }: { studentId: number }) {
	const [assessments, setAssessments] = useState<Assessment[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		type: "Test",
		title: "",
		score: "",
		maxScore: "",
		grade: "",
		notes: "",
		date: new Date().toISOString().split("T")[0],
	});

	const loadAssessments = async () => {
		const res = await fetch(`/api/assessments?studentId=${studentId}`);
		if (res.ok) setAssessments(await res.json());
	};

	useEffect(() => {
		loadAssessments();
	}, [studentId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		await fetch("/api/assessments", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ studentId, ...form }),
		});
		setForm({ type: "Test", title: "", score: "", maxScore: "", grade: "", notes: "", date: new Date().toISOString().split("T")[0] });
		setShowForm(false);
		setLoading(false);
		loadAssessments();
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this result?")) return;
		await fetch(`/api/assessments/${id}`, { method: "DELETE" });
		loadAssessments();
	};

	const averageScore = (() => {
		const scored = assessments.filter((a) => a.score !== null && a.maxScore !== null && a.maxScore > 0);
		if (scored.length === 0) return null;
		const total = scored.reduce((sum, a) => sum + (a.score! / a.maxScore!) * 100, 0);
		return Math.round(total / scored.length);
	})();

	const typeBadge = (type: string) => {
		const colors: Record<string, string> = {
			Test: "bg-blue-100 text-blue-800",
			Homework: "bg-purple-100 text-purple-800",
			Classwork: "bg-green-100 text-green-800",
			Exam: "bg-red-100 text-red-800",
			Other: "bg-gray-100 text-gray-800",
		};
		return colors[type] || "bg-gray-100 text-gray-800";
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm p-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-medium">Results</h3>
					{averageScore !== null && (
						<span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
							Avg: {averageScore}%
						</span>
					)}
				</div>
				<button
					onClick={() => setShowForm(!showForm)}
					className="text-sm bg-[#3D4756] text-white px-3 py-1.5 rounded-lg hover:bg-[#2A3441] transition-colors"
				>
					+ Log Result
				</button>
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
					<div className="grid grid-cols-2 gap-3">
						<select
							value={form.type}
							onChange={(e) => setForm({ ...form, type: e.target.value })}
							className="border rounded-lg px-3 py-2 text-sm"
						>
							{ASSESSMENT_TYPES.map((t) => (
								<option key={t} value={t}>{t}</option>
							))}
						</select>
						<input
							type="date"
							value={form.date}
							onChange={(e) => setForm({ ...form, date: e.target.value })}
							required
							className="border rounded-lg px-3 py-2 text-sm"
						/>
					</div>
					<input
						type="text"
						placeholder="Title (e.g. Chapter 5 Test)"
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
						required
						className="w-full border rounded-lg px-3 py-2 text-sm"
					/>
					<div className="grid grid-cols-3 gap-3">
						<input
							type="number"
							placeholder="Score"
							step="0.1"
							value={form.score}
							onChange={(e) => setForm({ ...form, score: e.target.value })}
							className="border rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<input
							type="number"
							placeholder="Max score"
							step="0.1"
							value={form.maxScore}
							onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
							className="border rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
						<input
							type="text"
							placeholder="Grade (opt)"
							value={form.grade}
							onChange={(e) => setForm({ ...form, grade: e.target.value })}
							className="border rounded-lg px-3 py-2 text-sm"
						/>
					</div>
					<input
						type="text"
						placeholder="Notes (optional)"
						value={form.notes}
						onChange={(e) => setForm({ ...form, notes: e.target.value })}
						className="w-full border rounded-lg px-3 py-2 text-sm"
					/>
					<div className="flex gap-2">
						<button type="submit" disabled={loading} className="text-sm bg-[#3D4756] text-white px-3 py-1.5 rounded-lg hover:bg-[#2A3441] disabled:opacity-50">
							{loading ? "Saving..." : "Save"}
						</button>
						<button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
							Cancel
						</button>
					</div>
				</form>
			)}

			{assessments.length > 0 ? (
				<div className="space-y-2">
					{assessments.map((a) => (
						<div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
							<div className="flex items-center gap-3">
								<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge(a.type)}`}>
									{a.type}
								</span>
								<div>
									<div className="text-sm font-medium text-gray-900">{a.title}</div>
									<div className="text-xs text-gray-500">
										{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
										{a.notes && ` · ${a.notes}`}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								{a.score !== null && a.maxScore !== null ? (
									<div className="text-right">
										<div className="text-sm font-semibold">{a.score}/{a.maxScore}</div>
										<div className="text-xs text-gray-500">{Math.round((a.score / a.maxScore) * 100)}%</div>
									</div>
								) : a.grade ? (
									<div className="text-sm font-semibold">{a.grade}</div>
								) : null}
								<button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500 text-xs">×</button>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-400 text-center py-4">No results logged yet.</p>
			)}
		</div>
	);
}
