"use client";

import { useEffect, useMemo, useState } from "react";
import { COLOR_OPTIONS, getDefaultSubjectColor } from "@/app/students/subjectColors";

type OrgPrefsResponse = {
	defaultStudentRateCents: number | null;
	defaultSubjects: string[];
	subjectColors: Record<string, string>;
};

function dollarsToCents(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const num = Number(trimmed);
	if (!Number.isFinite(num) || num < 0) return null;
	return Math.round(num * 100);
}

function centsToDollars(cents: number | null): string {
	if (cents == null) return "";
	return (cents / 100).toFixed(2);
}

export default function TeachingDefaultsClient() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const [defaultRate, setDefaultRate] = useState<string>("");
	const [subjects, setSubjects] = useState<string[]>([]);
	const [colors, setColors] = useState<Record<string, string>>({});
	const [newSubject, setNewSubject] = useState("");

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/org/preferences", { method: "GET" });
				const data = (await res.json()) as OrgPrefsResponse;
				if (!res.ok) throw new Error((data as any)?.error || "Failed to load defaults");
				if (cancelled) return;
				setDefaultRate(centsToDollars(data.defaultStudentRateCents ?? null));
				setSubjects(Array.isArray(data.defaultSubjects) ? data.defaultSubjects : []);
				setColors(data.subjectColors ?? {});

				// Backwards-compat: prime localStorage so existing UI keeps working.
				try {
					localStorage.setItem(
						"availableSubjects",
						JSON.stringify(Array.isArray(data.defaultSubjects) ? data.defaultSubjects : [])
					);
					localStorage.setItem(
						"customSubjectColors",
						JSON.stringify(data.subjectColors ?? {})
					);
				} catch {}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || "Failed to load defaults");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const subjectRows = useMemo(() => {
		return subjects
			.map((s) => s.trim())
			.filter(Boolean)
			.sort((a, b) => a.localeCompare(b));
	}, [subjects]);

	const save = async (next?: Partial<OrgPrefsResponse>) => {
		setError(null);
		setSuccess(null);
		setSaving(true);
		try {
			const payload = {
				defaultStudentRateCents:
					next?.defaultStudentRateCents ??
					(() => {
						const cents = dollarsToCents(defaultRate);
						return cents == null ? null : cents;
					})(),
				defaultSubjects: next?.defaultSubjects ?? subjects,
				subjectColors: next?.subjectColors ?? colors,
			};

			const res = await fetch("/api/org/preferences", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = (await res.json()) as OrgPrefsResponse;
			if (!res.ok) throw new Error((data as any)?.error || "Failed to save defaults");

			setDefaultRate(centsToDollars(data.defaultStudentRateCents ?? null));
			setSubjects(Array.isArray(data.defaultSubjects) ? data.defaultSubjects : []);
			setColors(data.subjectColors ?? {});

			try {
				localStorage.setItem(
					"availableSubjects",
					JSON.stringify(Array.isArray(data.defaultSubjects) ? data.defaultSubjects : [])
				);
				localStorage.setItem(
					"customSubjectColors",
					JSON.stringify(data.subjectColors ?? {})
				);
			} catch {}

			setSuccess("Saved.");
		} catch (e: any) {
			setError(e?.message || "Failed to save defaults");
		} finally {
			setSaving(false);
		}
	};

	const addSubject = async () => {
		const trimmed = newSubject.trim();
		if (!trimmed) return;
		if (subjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
			setNewSubject("");
			return;
		}
		const nextSubjects = [...subjects, trimmed];
		const nextColors = { ...colors };
		if (!nextColors[trimmed]) nextColors[trimmed] = getDefaultSubjectColor(trimmed);
		setSubjects(nextSubjects);
		setColors(nextColors);
		setNewSubject("");
		await save({ defaultSubjects: nextSubjects, subjectColors: nextColors });
	};

	const removeSubject = async (subject: string) => {
		const nextSubjects = subjects.filter((s) => s !== subject);
		const nextColors = { ...colors };
		delete nextColors[subject];
		setSubjects(nextSubjects);
		setColors(nextColors);
		await save({ defaultSubjects: nextSubjects, subjectColors: nextColors });
	};

	const setColor = async (subject: string, nextColor: string) => {
		const nextColors = { ...colors, [subject]: nextColor };
		setColors(nextColors);
		await save({ subjectColors: nextColors });
	};

	if (loading) {
		return <div className="text-sm text-gray-500">Loading…</div>;
	}

	return (
		<div className="space-y-4">
			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					{error}
				</div>
			)}
			{success && (
				<div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
					{success}
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<label className="block">
					<div className="text-sm font-medium text-gray-700">
						Default student hourly rate ($)
					</div>
					<input
						value={defaultRate}
						onChange={(e) => setDefaultRate(e.target.value)}
						placeholder="e.g. 75.00"
						inputMode="decimal"
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
					/>
					<div className="mt-1 text-xs text-gray-500">
						Used as the default when creating a student (you can still override per-student).
					</div>
				</label>
				<div className="flex items-end">
					<button
						type="button"
						onClick={() => void save()}
						disabled={saving}
						className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] disabled:opacity-60 transition-colors"
					>
						{saving ? "Saving..." : "Save defaults"}
					</button>
				</div>
			</div>

			<div className="border-t border-gray-100 pt-4 space-y-3">
				<div className="text-sm font-medium text-gray-900">Subject options (org-wide)</div>
				<div className="flex flex-col sm:flex-row gap-2">
					<input
						value={newSubject}
						onChange={(e) => setNewSubject(e.target.value)}
						placeholder="Add a subject…"
						className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								void addSubject();
							}
						}}
					/>
					<button
						type="button"
						onClick={() => void addSubject()}
						disabled={saving}
						className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
					>
						Add
					</button>
				</div>

				{subjectRows.length === 0 ? (
					<div className="text-sm text-gray-500">No subjects configured yet.</div>
				) : (
					<div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
						{subjectRows.map((subject) => (
							<div
								key={subject}
								className="flex items-center justify-between gap-3 px-4 py-2 bg-white"
							>
								<div className="min-w-0">
									<div className="text-sm font-medium text-gray-900 truncate">
										{subject}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<select
										value={colors[subject] ?? getDefaultSubjectColor(subject)}
										onChange={(e) => void setColor(subject, e.target.value)}
										className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#584b53]"
										title="Color"
									>
										{COLOR_OPTIONS.map((opt) => (
											<option key={opt.name} value={opt.classes}>
												{opt.name}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={() => void removeSubject(subject)}
										disabled={saving}
										className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

