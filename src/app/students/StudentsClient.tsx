"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import SubjectsDisplay from "./SubjectsDisplay";
import StatusIndicator from "./StatusIndicator";

const STORAGE_KEY_COLUMN_WIDTHS = "studentsTableColumnWidths";
const DEFAULT_COLUMN_WIDTHS = [140, 140, 200, 80, 90, 100];
const MIN_COLUMN_WIDTH = 48;

type StudentItem = {
	id: number;
	firstName: string;
	lastName: string;
	email: string | null;
	phone: string | null;
	subjects: string | null;
	hourlyRateCents: number;
	year?: number | null;
	isArchived: boolean;
	updatedAt?: string | Date;
};

type EditableField = "firstName" | "lastName" | "subjects" | "year" | "hourlyRate";

type Filter = {
    id: string;
    field: 'year' | 'subjects' | 'isArchived';
    condition: 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'isGreaterThan' | 'isLessThan';
    value: any;
};

function formatCurrencyFromCents(valueInCents: number): string {
	const dollars = (valueInCents / 100).toFixed(2);
	return `$${dollars}`;
}

export default function StudentsClient({ students, archivedStudents }: { students: StudentItem[], archivedStudents: StudentItem[] }) {
	const [allStudents, setAllStudents] = useState<StudentItem[]>(() => [...students, ...archivedStudents]);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingCell, setEditingCell] = useState<{ id: number; field: EditableField } | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const [savingCell, setSavingCell] = useState<string | null>(null);

    const [newRow, setNewRow] = useState({ firstName: "", lastName: "", subjects: "", year: "", hourlyRate: "" });
    const [savingNewRow, setSavingNewRow] = useState(false);
    const [showNewRow, setShowNewRow] = useState(false);
    const newRowFirstInputRef = useRef<HTMLInputElement>(null);

    const [columnWidths, setColumnWidths] = useState<number[]>(DEFAULT_COLUMN_WIDTHS);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTHS);
            if (stored) {
                const parsed = JSON.parse(stored) as number[];
                if (Array.isArray(parsed) && parsed.length === DEFAULT_COLUMN_WIDTHS.length) {
                    setColumnWidths(parsed.map((w) => Math.max(MIN_COLUMN_WIDTH, Number(w) || MIN_COLUMN_WIDTH)));
                }
            }
        } catch (_) {}
    }, []);
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);

    useEffect(() => {
        if (resizingIndex === null) return;
        const onMove = (e: MouseEvent) => {
            const delta = e.clientX - resizeStartX;
            setColumnWidths((prev) => {
                const next = [...prev];
                const newW = Math.max(MIN_COLUMN_WIDTH, resizeStartWidth + delta);
                next[resizingIndex] = newW;
                try {
                    localStorage.setItem(STORAGE_KEY_COLUMN_WIDTHS, JSON.stringify(next));
                } catch (_) {}
                return next;
            });
        };
        const onUp = () => {
            setResizingIndex(null);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [resizingIndex, resizeStartX, resizeStartWidth]);

    const startResize = (index: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingIndex(index);
        setResizeStartX(e.clientX);
        setResizeStartWidth(columnWidths[index]);
    };

    const handleSort = (field: string) => {
        if (sortField !== field) {
            // First click: set new field and ascending
            setSortField(field);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            // Second click: change to descending
            setSortDirection('desc');
        } else {
            // Third click: remove sort
            setSortField(null);
            setSortDirection(null);
        }
    };

    const filteredStudents = useMemo(() => {
        let result = allStudents;

        // Apply filters
        if (filters.length > 0) {
            result = allStudents.filter(student => {
                return filters.every(filter => {
                    const { field, condition, value } = filter;
                    const studentValue = student[field as keyof StudentItem];

                    switch (condition) {
                        case 'is':
                            return studentValue == value;
                        case 'isNot':
                            return studentValue != value;
                        case 'contains':
                            return typeof studentValue === 'string' && studentValue.toLowerCase().includes(value.toLowerCase());
                        case 'doesNotContain':
                            return typeof studentValue === 'string' && !studentValue.toLowerCase().includes(value.toLowerCase());
                        case 'isGreaterThan':
                            return typeof studentValue === 'number' && studentValue > value;
                        case 'isLessThan':
                            return typeof studentValue === 'number' && studentValue < value;
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply search
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter((student) => {
                const name = `${student.firstName} ${student.lastName}`.toLowerCase();
                const subjects = (student.subjects || "").toLowerCase();
                return name.includes(q) || subjects.includes(q);
            });
        }

        // Apply sorting
        if (sortField && sortDirection) {
            result = [...result].sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortField) {
                    case 'record':
                        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                        break;
                    case 'subjects':
                        aValue = (a.subjects || '').toLowerCase();
                        bValue = (b.subjects || '').toLowerCase();
                        break;
                    case 'year':
                        aValue = a.year ?? -1;
                        bValue = b.year ?? -1;
                        break;
                    case 'hourlyRate':
                        aValue = a.hourlyRateCents;
                        bValue = b.hourlyRateCents;
                        break;
                    case 'status':
                        aValue = a.isArchived ? 1 : 0;
                        bValue = b.isArchived ? 1 : 0;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [allStudents, filters, sortField, sortDirection, searchTerm]);

    const getCellKey = (id: number, field: EditableField) => `${id}:${field}`;

    const getInitialValue = (student: StudentItem, field: EditableField) => {
        if (field === "firstName") return student.firstName ?? "";
        if (field === "lastName") return student.lastName ?? "";
        if (field === "subjects") return student.subjects ?? "";
        if (field === "year") return student.year?.toString() ?? "";
        if (field === "hourlyRate") return (student.hourlyRateCents / 100).toFixed(2);
        return "";
    };

    const startEditing = (student: StudentItem, field: EditableField) => {
        setEditingCell({ id: student.id, field });
        setDraftValue(getInitialValue(student, field));
    };

    const cancelEditing = () => {
        setEditingCell(null);
        setDraftValue("");
    };

    const saveEditing = async () => {
        if (!editingCell) return;
        const cellKey = getCellKey(editingCell.id, editingCell.field);
        if (savingCell === cellKey) return;

        const student = allStudents.find((s) => s.id === editingCell.id);
        if (!student) {
            cancelEditing();
            return;
        }

        const initial = getInitialValue(student, editingCell.field).trim();
        const next = draftValue.trim();
        if (initial === next) {
            cancelEditing();
            return;
        }

        setSavingCell(cellKey);
        try {
            const res = await fetch(`/api/students/${editingCell.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field: editingCell.field, value: draftValue }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.error || "Failed to save");
            }

            const data = await res.json();
            const updated = data.student as Partial<StudentItem> & { id: number };
            setAllStudents((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            );
            cancelEditing();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save student";
            alert(message);
        } finally {
            setSavingCell(null);
        }
    };

    const saveNewRow = async () => {
        const first = newRow.firstName.trim();
        const last = newRow.lastName.trim();
        if (!first || !last || savingNewRow) return;
        setSavingNewRow(true);
        try {
            const res = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: first,
                    lastName: last,
                    subjects: newRow.subjects.trim(),
                    year: newRow.year.trim() ? Number(newRow.year.trim()) : null,
                    hourlyRate: newRow.hourlyRate.trim() ? Number(newRow.hourlyRate.trim()) : 0,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to create student");
            }
            const data = await res.json();
            const created = data.student as StudentItem;
            setAllStudents((prev) => [created, ...prev]);
            setNewRow({ firstName: "", lastName: "", subjects: "", year: "", hourlyRate: "" });
            setShowNewRow(false);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to create student");
        } finally {
            setSavingNewRow(false);
        }
    };

    const handleNewRowBlur = () => {
        if (newRow.firstName.trim() && newRow.lastName.trim()) void saveNewRow();
    };

    const startNewPage = () => {
        setNewRow({ firstName: "", lastName: "", subjects: "", year: "", hourlyRate: "" });
        setShowNewRow(true);
        setTimeout(() => newRowFirstInputRef.current?.focus(), 0);
    };

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-[#3D4756]">Students</h2>
				<div className="flex items-center gap-3">
                    {savingCell ? <span className="text-xs text-gray-500">Saving...</span> : null}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                    />
					<Link
						className="rounded-md bg-[#3D4756] text-white p-2 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
						href="/students/new"
						title="Add Student"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</Link>
				</div>
			</div>

            {filters.length > 0 && (
                <div className="p-4 flex items-center gap-2">
                    {filters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                            <span>{filter.field} {filter.condition} {filter.value.toString()}</span>
                            <button onClick={() => setFilters(filters.filter(f => f.id !== filter.id))} className="text-gray-500 hover:text-gray-800">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

			<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
				<table className="w-full text-left text-sm table-fixed" style={{ tableLayout: "fixed" }}>
					<colgroup>
						{columnWidths.map((w, i) => (
							<col key={i} style={{ width: w }} />
						))}
					</colgroup>
					<thead className="bg-white border-b border-gray-200">
						<tr>
							<th
								style={{ width: columnWidths[0] }}
								className="relative px-4 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors select-none"
								onClick={() => handleSort('record')}
							>
								<div className="flex items-center gap-2 truncate">
									<span>First name</span>
									<span className="text-xs w-3 inline-block text-center shrink-0">
										{sortField === 'record' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
								<div role="separator" onMouseDown={startResize(0)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
							<th
								style={{ width: columnWidths[1] }}
								className="relative px-4 py-4 font-semibold text-gray-900"
							>
								<span className="truncate block">Last Name</span>
								<div role="separator" onMouseDown={startResize(1)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
							<th
								style={{ width: columnWidths[2] }}
								className="relative px-4 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors select-none"
								onClick={() => handleSort('subjects')}
							>
								<div className="flex items-center gap-2 truncate">
									<span>Subjects</span>
									<span className="text-xs w-3 inline-block text-center shrink-0">
										{sortField === 'subjects' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
								<div role="separator" onMouseDown={startResize(2)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
							<th
								style={{ width: columnWidths[3] }}
								className="relative px-4 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors select-none"
								onClick={() => handleSort('year')}
							>
								<div className="flex items-center gap-2 truncate">
									<span>Year</span>
									<span className="text-xs w-3 inline-block text-center shrink-0">
										{sortField === 'year' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
								<div role="separator" onMouseDown={startResize(3)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
							<th
								style={{ width: columnWidths[4] }}
								className="relative px-4 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors select-none"
								onClick={() => handleSort('hourlyRate')}
							>
								<div className="flex items-center gap-2 truncate">
									<span>Rate</span>
									<span className="text-xs w-3 inline-block text-center shrink-0">
										{sortField === 'hourlyRate' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
								<div role="separator" onMouseDown={startResize(4)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
							<th
								style={{ width: columnWidths[5] }}
								className="relative px-4 py-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors select-none"
								onClick={() => handleSort('status')}
							>
								<div className="flex items-center gap-2 truncate">
									<span>Status</span>
									<span className="text-xs w-3 inline-block text-center shrink-0">
										{sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
								<div role="separator" onMouseDown={startResize(5)} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20" title="Resize column" />
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredStudents.map((s) => (
							<tr key={s.id} className="border-t border-gray-200 hover:bg-gray-50">
								<td
									className="px-4 py-4 font-medium text-gray-900 cursor-text align-middle min-h-[3rem] h-12"
									onClick={() => startEditing(s, "firstName")}
								>
									{editingCell?.id === s.id && editingCell.field === "firstName" ? (
										<input
											autoFocus
											value={draftValue}
											onChange={(e) => setDraftValue(e.target.value)}
											onBlur={saveEditing}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void saveEditing();
												} else if (e.key === "Escape") {
													e.preventDefault();
													cancelEditing();
												}
											}}
											className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm font-medium text-gray-900"
										/>
									) : (
										<span className="block truncate">{s.firstName}</span>
									)}
								</td>
								<td
									className="px-4 py-4 font-medium text-gray-900 cursor-text align-middle min-h-[3rem] h-12"
									onClick={() => startEditing(s, "lastName")}
								>
									{editingCell?.id === s.id && editingCell.field === "lastName" ? (
										<input
											autoFocus
											value={draftValue}
											onChange={(e) => setDraftValue(e.target.value)}
											onBlur={saveEditing}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void saveEditing();
												} else if (e.key === "Escape") {
													e.preventDefault();
													cancelEditing();
												}
											}}
											className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm font-medium text-gray-900"
										/>
									) : (
										<span className="block truncate">{s.lastName}</span>
									)}
								</td>
								<td
									className="px-4 py-4 cursor-text align-middle min-h-[3rem] h-12"
									onClick={() => startEditing(s, "subjects")}
								>
									{editingCell?.id === s.id && editingCell.field === "subjects" ? (
										<input
											autoFocus
											value={draftValue}
											onChange={(e) => setDraftValue(e.target.value)}
											onBlur={saveEditing}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void saveEditing();
												} else if (e.key === "Escape") {
													e.preventDefault();
													cancelEditing();
												}
											}}
											className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900"
										/>
									) : (
										<SubjectsDisplay subjects={s.subjects || ""} />
									)}
								</td>
								<td
									className="px-4 py-4 text-sm text-gray-900 cursor-text align-middle min-h-[3rem] h-12"
									onClick={() => startEditing(s, "year")}
								>
									{editingCell?.id === s.id && editingCell.field === "year" ? (
										<input
											autoFocus
											value={draftValue}
											onChange={(e) => setDraftValue(e.target.value)}
											onBlur={saveEditing}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void saveEditing();
												} else if (e.key === "Escape") {
													e.preventDefault();
													cancelEditing();
												}
											}}
											className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900"
										/>
									) : (
										<span className="block truncate">{s.year || "—"}</span>
									)}
								</td>
								<td
									className="px-4 py-4 cursor-text align-middle min-h-[3rem] h-12"
									onClick={() => startEditing(s, "hourlyRate")}
								>
									{editingCell?.id === s.id && editingCell.field === "hourlyRate" ? (
										<input
											autoFocus
											value={draftValue}
											onChange={(e) => setDraftValue(e.target.value)}
											onBlur={saveEditing}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													void saveEditing();
												} else if (e.key === "Escape") {
													e.preventDefault();
													cancelEditing();
												}
											}}
											className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900"
										/>
									) : (
										<span className="block truncate">{formatCurrencyFromCents(s.hourlyRateCents)}</span>
									)}
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
                                    <StatusIndicator isActive={!s.isArchived} />
                                </td>
							</tr>
						))}
						{/* Notion-style: "+ New page" creates an empty row to fill in */}
						{!showNewRow ? (
							<tr className="border-t border-gray-200">
								<td
									colSpan={6}
									className="px-4 py-3 align-middle min-h-[3rem]"
								>
									<button
										type="button"
										onClick={startNewPage}
										className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded px-1 py-0.5 -ml-1 transition-colors"
									>
										<span className="text-gray-400">+</span>
										<span>New page</span>
									</button>
								</td>
							</tr>
						) : (
							<tr className="border-t border-gray-200 bg-gray-50/50">
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									<input
										ref={newRowFirstInputRef}
										placeholder="First name"
										value={newRow.firstName}
										onChange={(e) => setNewRow((r) => ({ ...r, firstName: e.target.value }))}
										onBlur={handleNewRowBlur}
										onKeyDown={(e) => { if (e.key === "Escape") setShowNewRow(false); if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).closest("td")?.nextElementSibling?.querySelector("input")?.focus(); } }}
										className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm font-medium text-gray-900 placeholder:text-gray-400"
									/>
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									<input
										placeholder="Last name"
										value={newRow.lastName}
										onChange={(e) => setNewRow((r) => ({ ...r, lastName: e.target.value }))}
										onBlur={handleNewRowBlur}
										onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).closest("td")?.nextElementSibling?.querySelector("input")?.focus(); } }}
										className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm font-medium text-gray-900 placeholder:text-gray-400"
									/>
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									<input
										placeholder="Subjects"
										value={newRow.subjects}
										onChange={(e) => setNewRow((r) => ({ ...r, subjects: e.target.value }))}
										onBlur={handleNewRowBlur}
										onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).closest("td")?.nextElementSibling?.querySelector("input")?.focus(); } }}
										className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900 placeholder:text-gray-400"
									/>
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									<input
										placeholder="Year"
										value={newRow.year}
										onChange={(e) => setNewRow((r) => ({ ...r, year: e.target.value }))}
										onBlur={handleNewRowBlur}
										onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).closest("td")?.nextElementSibling?.querySelector("input")?.focus(); } }}
										className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900 placeholder:text-gray-400"
									/>
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									<input
										placeholder="Rate"
										value={newRow.hourlyRate}
										onChange={(e) => setNewRow((r) => ({ ...r, hourlyRate: e.target.value }))}
										onBlur={handleNewRowBlur}
										onKeyDown={(e) => { if (e.key === "Enter") handleNewRowBlur(); }}
										className="inline-cell-input w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-sm text-gray-900 placeholder:text-gray-400"
									/>
								</td>
								<td className="px-4 py-4 align-middle min-h-[3rem] h-12">
									{savingNewRow ? (
										<span className="text-xs text-gray-500">Saving...</span>
									) : (
										<button type="button" onClick={() => setShowNewRow(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
									)}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


