"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface NiceDatePickerProps {
	name: string;
	/** Optional controlled value (yyyy-mm-dd). If omitted, component manages its own state. */
	value?: string;
	/** Called when a date is picked. Required when value is controlled; optional otherwise. */
	onChange?: (next: string) => void;
	/** Initial value for uncontrolled mode (yyyy-mm-dd). */
	initialValue?: string;
}

const DISPLAY_LOCALE = "en-GB";

function formatDisplayDate(value: string): string {
	if (!value) return "Select date";
	const d = new Date(value + "T12:00:00");
	if (Number.isNaN(d.getTime())) return "Select date";
	return d.toLocaleDateString(DISPLAY_LOCALE, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function toISODate(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NiceDatePicker({
	name,
	value,
	onChange,
	initialValue,
}: NiceDatePickerProps) {
	const isControlled = value !== undefined && onChange !== undefined;
	const todayISO = new Date().toISOString().split("T")[0];
	const initialISO = isControlled ? value || todayISO : initialValue || todayISO;
	const [internalValue, setInternalValue] = useState<string>(initialISO);

	const effectiveValue = isControlled ? value || "" : internalValue;

	const initialDate = effectiveValue ? new Date(effectiveValue) : new Date();
	const [open, setOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(
		new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
	);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(e.target as Node)) setOpen(false);
		};
		if (open) document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [open]);

	// Re-sync month if external value changes (controlled) or initialValue changes (uncontrolled)
	useEffect(() => {
		const src = isControlled ? effectiveValue : internalValue;
		if (!src) return;
		const d = new Date(src);
		if (!Number.isNaN(d.getTime())) {
			setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
		}
	}, [effectiveValue, internalValue, isControlled]);

	const cells = useMemo(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0-6
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();

		const totalCells = 42; // 6 rows x 7 days
		const result: {
			label: number;
			inCurrentMonth: boolean;
			date: Date;
		}[] = [];

		for (let i = 0; i < totalCells; i++) {
			const dayIndex = i - firstDayOfWeek + 1;
			let cellDate: Date;
			let inCurrentMonth = true;
			let label: number;

			if (dayIndex <= 0) {
				// previous month
				const d = daysInPrevMonth + dayIndex;
				cellDate = new Date(year, month - 1, d);
				label = d;
				inCurrentMonth = false;
			} else if (dayIndex > daysInMonth) {
				// next month
				const d = dayIndex - daysInMonth;
				cellDate = new Date(year, month + 1, d);
				label = d;
				inCurrentMonth = false;
			} else {
				cellDate = new Date(year, month, dayIndex);
				label = dayIndex;
				inCurrentMonth = true;
			}

			result.push({ label, inCurrentMonth, date: cellDate });
		}
		return result;
	}, [currentMonth]);

	const selectedISO = effectiveValue || "";

	return (
		<div ref={containerRef} className="relative inline-block text-sm">
			{/* Hidden form input */}
			<input type="hidden" name={name} value={selectedISO} />

			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
			>
				<span className="text-gray-500">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</span>
				<span className={selectedISO ? "text-gray-900" : "text-gray-400"}>
					{formatDisplayDate(selectedISO)}
				</span>
			</button>

			{open && (
				<div className="absolute left-0 mt-2 z-40">
					<div className="rounded-3xl shadow-lg border border-gray-200 bg-white overflow-hidden w-80">
						<div className="px-4 pt-3 pb-2 flex items-center justify-between">
							<button
								type="button"
								onClick={() =>
									setCurrentMonth(
										(prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
									)
								}
								className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
								aria-label="Previous month"
							>
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
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<div className="text-sm font-medium text-gray-900">
								{currentMonth.toLocaleDateString(DISPLAY_LOCALE, {
									year: "numeric",
									month: "long",
								})}
							</div>
							<button
								type="button"
								onClick={() =>
									setCurrentMonth(
										(prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
									)
								}
								className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
								aria-label="Next month"
							>
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
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>

						<div className="px-4 pb-3">
							<div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 mb-2">
								{WEEKDAYS.map((d) => (
									<div key={d}>{d}</div>
								))}
							</div>
							<div className="grid grid-cols-7 gap-y-1 text-center text-xs pb-2">
								{cells.map((cell, idx) => {
									const iso = toISODate(cell.date);
									const isSelected = iso === selectedISO;
									const isToday =
										iso === toISODate(new Date()) && cell.inCurrentMonth;

									let baseClasses =
										"mx-auto flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-colors";

									const textClasses = "";

									if (isSelected) {
										baseClasses += " bg-blue-500 text-white";
									} else if (!cell.inCurrentMonth) {
										baseClasses += " text-gray-300 hover:bg-gray-100";
									} else if (isToday) {
										baseClasses +=
											" border border-blue-400 text-blue-600 hover:bg-blue-50";
									} else {
										baseClasses +=
											" text-gray-800 hover:bg-gray-100 active:bg-gray-200";
									}

									return (
										<button
											key={`${iso}-${idx}`}
											type="button"
											onClick={() => {
												if (isControlled) {
													onChange?.(iso);
												} else {
													setInternalValue(iso);
												}
												setOpen(false);
											}}
											className={baseClasses}
										>
											<span className={textClasses}>{cell.label}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

