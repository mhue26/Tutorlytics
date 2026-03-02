"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NiceDatePicker from "@/app/components/NiceDatePicker";

const SCOPE_OPTIONS = [
	{ value: "ORGANISATION", label: "Organisation" },
	{ value: "CLASS", label: "Class" },
	{ value: "YEAR_LEVEL", label: "Year level" },
] as const;

interface ClassOption {
	id: number;
	name: string;
}

interface InitialData {
	id: string;
	title: string;
	date: string;
	description: string;
	scope: string;
	classId: string;
	year: string;
	color: string;
}

interface KeydateEditClientProps {
	keyDateId: string;
	initial: InitialData;
	classes: ClassOption[];
}

export default function KeydateEditClient({
	keyDateId,
	initial,
	classes,
}: KeydateEditClientProps) {
	const router = useRouter();
	const [title, setTitle] = useState(initial.title);
	const [date, setDate] = useState(initial.date);
	const [description, setDescription] = useState(initial.description);
	const [scope, setScope] = useState(initial.scope);
	const [classId, setClassId] = useState(initial.classId);
	const [year, setYear] = useState(initial.year);
	const [color, setColor] = useState(initial.color || "#f59e0b");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSaving(true);
		try {
			const body: Record<string, unknown> = {
				title,
				date: new Date(date + "T12:00:00").toISOString().slice(0, 10),
				description: description || null,
				scope,
				color: color || null,
				classId: scope === "CLASS" && classId ? parseInt(classId, 10) : null,
				year: scope === "YEAR_LEVEL" && year ? parseInt(year, 10) : null,
			};
			const res = await fetch(`/api/key-dates/${keyDateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Failed to update");
			}
			router.push(`/calendar/event/keydate/${keyDateId}`);
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
							onClick={() => router.push(`/calendar/event/keydate/${keyDateId}`)}
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
						form="keydate-edit-form"
						disabled={saving}
						className="px-6 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] focus:outline-none focus:ring-2 focus:ring-[#3D4756] focus:ring-offset-2 transition-colors disabled:opacity-50"
					>
						{saving ? "Saving…" : "Save"}
					</button>
				</div>

				<div className="bg-white rounded-2xl shadow-xl p-6">
					<form id="keydate-edit-form" onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
						)}

						<div>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className="w-full text-2xl font-medium border-none outline-none placeholder-gray-400 text-gray-900"
								placeholder="Add title"
							/>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-600">Type</span>
							<div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
								<span className="px-3 py-1 text-gray-600 cursor-default">Lesson</span>
								<span className="px-3 py-1 text-gray-600 cursor-default">Check-in</span>
								<span className="px-3 py-1 rounded-full font-medium bg-white text-gray-900 shadow-sm">
									Event
								</span>
							</div>
						</div>

						<div className="flex items-center gap-4 flex-wrap">
							<div className="flex items-center">
								<NiceDatePicker
									name="date"
									value={date}
									onChange={setDate}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="scope" className="block text-sm text-gray-600 mb-1.5">
								Scope
							</label>
							<select
								id="scope"
								value={scope}
								onChange={(e) => setScope(e.target.value)}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
							>
								{SCOPE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						{scope === "CLASS" && (
							<div>
								<label htmlFor="classId" className="block text-sm text-gray-600 mb-1.5">
									Class
								</label>
								<select
									id="classId"
									value={classId}
									onChange={(e) => setClassId(e.target.value)}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
								>
									<option value="">Select class</option>
									{classes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
							</div>
						)}

						{scope === "YEAR_LEVEL" && (
							<div>
								<label htmlFor="year" className="block text-sm text-gray-600 mb-1.5">
									Year
								</label>
								<input
									type="number"
									id="year"
									value={year}
									onChange={(e) => setYear(e.target.value)}
									min={1}
									max={13}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
									placeholder="e.g. 10"
								/>
							</div>
						)}

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
								</svg>
								<span className="text-sm text-gray-600">Description</span>
							</div>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
								placeholder="Add description or notes for this event..."
							/>
						</div>

						<div>
							<label htmlFor="color" className="block text-sm text-gray-600 mb-1.5">
								Color
							</label>
							<div className="flex gap-2 items-center">
								<input
									type="color"
									id="color"
									value={color}
									onChange={(e) => setColor(e.target.value)}
									className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer"
								/>
								<input
									type="text"
									value={color}
									onChange={(e) => setColor(e.target.value)}
									className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
									placeholder="#f59e0b"
								/>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
