"use client";

import { useMemo, useState, useTransition } from "react";

type StudentLite = {
	id: number;
	firstName: string;
	lastName: string;
};

export default function AddStudentsPicker({
	classId,
	eligibleStudents,
	assignStudentsAction,
}: {
	classId: number;
	eligibleStudents: StudentLite[];
	assignStudentsAction: (formData: FormData) => Promise<void>;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [isPending, startTransition] = useTransition();

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return eligibleStudents;
		return eligibleStudents.filter((s) => {
			const name = `${s.firstName} ${s.lastName}`.toLowerCase();
			return name.includes(q);
		});
	}, [eligibleStudents, search]);

	const toggle = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const onSubmit = () => {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) return;
		const fd = new FormData();
		fd.set("classId", String(classId));
		for (const id of ids) fd.append("studentIds", String(id));
		startTransition(async () => {
			await assignStudentsAction(fd);
		});
	};

	const close = () => {
		setOpen(false);
		setSearch("");
		setSelectedIds(new Set());
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors"
			>
				Add students
			</button>

			{open && (
				<div className="fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/30"
						onClick={() => !isPending && close()}
					/>
					<div className="absolute inset-0 flex items-center justify-center p-4">
						<div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200">
							<div className="p-4 border-b border-gray-100 flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold text-gray-900">
										Add students
									</h3>
									<p className="text-xs text-gray-500">
										Select existing students to assign to this class.
									</p>
								</div>
								<button
									type="button"
									onClick={() => !isPending && close()}
									className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
									aria-label="Close"
								>
									<svg
										className="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							<div className="p-4 space-y-3">
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search students"
									className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
								/>

								<div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200">
									{filtered.length === 0 ? (
										<div className="p-4 text-sm text-gray-500">
											No matching students.
										</div>
									) : (
										<ul className="divide-y divide-gray-100">
											{filtered.map((s) => {
												const checked = selectedIds.has(s.id);
												return (
													<li
														key={s.id}
														className="flex items-center justify-between p-3 hover:bg-gray-50"
													>
														<label className="flex items-center gap-3 cursor-pointer select-none">
															<input
																type="checkbox"
																checked={checked}
																onChange={() => toggle(s.id)}
																className="rounded border-gray-300"
															/>
															<span className="text-sm text-gray-900">
																{s.firstName} {s.lastName}
															</span>
														</label>
													</li>
												);
											})}
										</ul>
									)}
								</div>
							</div>

							<div className="p-4 border-t border-gray-100 flex items-center justify-between">
								<div className="text-xs text-gray-500">
									{selectedIds.size} selected
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => !isPending && close()}
										className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
										disabled={isPending}
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={onSubmit}
										className="px-3 py-2 rounded-md text-sm font-medium bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors disabled:opacity-50"
										disabled={isPending || selectedIds.size === 0}
									>
										{isPending ? "Adding…" : `Add ${selectedIds.size}`}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

