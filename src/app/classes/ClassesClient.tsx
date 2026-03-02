"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY_COLUMN_WIDTHS = "classesTableColumnWidths";
const MIN_COLUMN_WIDTH = 48;

const COLUMN_IDS = ["class", "subject", "year", "rate", "format", "students", "created"] as const;
const DEFAULT_COLUMN_WIDTHS: Record<(typeof COLUMN_IDS)[number], number> = {
  class: 200,
  subject: 140,
  year: 80,
  rate: 90,
  format: 100,
  students: 80,
  created: 100,
};

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Class {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  subject?: string | null;
  year?: number | null;
  defaultRateCents?: number | null;
  format?: "IN_PERSON" | "ONLINE" | "HYBRID";
  students: Student[];
}

type EditableField = "name" | "subject" | "year" | "defaultRate" | "format";

interface ClassesClientProps {
  classes: Class[];
}

export default function ClassesClient({ classes: initialClasses }: ClassesClientProps) {
  const [allClasses, setAllClasses] = useState<Class[]>(() => [...initialClasses]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<{ id: number; field: EditableField } | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [columnWidths, setColumnWidths] = useState<number[]>(() =>
    COLUMN_IDS.map((id) => Math.max(MIN_COLUMN_WIDTH, DEFAULT_COLUMN_WIDTHS[id]))
  );
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTHS);
      if (stored) {
        const parsed = JSON.parse(stored) as number[];
        if (Array.isArray(parsed) && parsed.length === COLUMN_IDS.length) {
          setColumnWidths(parsed.map((w) => Math.max(MIN_COLUMN_WIDTH, Number(w) || MIN_COLUMN_WIDTH)));
        }
      }
    } catch (_) {}
  }, []);

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

  const formatRate = (cents?: number | null) => {
    if (!cents || cents <= 0) return "—";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatFormat = (format?: Class["format"]) => {
    if (!format) return "—";
    if (format === "IN_PERSON") return "In person";
    if (format === "ONLINE") return "Online";
    if (format === "HYBRID") return "Hybrid";
    return "—";
  };

  const getInitialValue = (c: Class, field: EditableField): string => {
    if (field === "name") return c.name ?? "";
    if (field === "subject") return c.subject ?? "";
    if (field === "year") return c.year?.toString() ?? "";
    if (field === "defaultRate") return c.defaultRateCents != null && c.defaultRateCents > 0 ? (c.defaultRateCents / 100).toFixed(2) : "";
    if (field === "format") return c.format ?? "IN_PERSON";
    return "";
  };

  const startEditing = (c: Class, field: EditableField) => {
    setErrorMessage(null);
    setEditingCell({ id: c.id, field });
    setDraftValue(getInitialValue(c, field));
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setDraftValue("");
  };

  const saveEditing = async () => {
    if (!editingCell) return;
    const cellKey = `${editingCell.id}:${editingCell.field}`;
    if (savingCell === cellKey) return;

    const cls = allClasses.find((c) => c.id === editingCell.id);
    if (!cls) {
      cancelEditing();
      return;
    }

    const initial = getInitialValue(cls, editingCell.field).trim();
    const next = draftValue.trim();
    if (initial === next) {
      cancelEditing();
      return;
    }
    if (editingCell.field === "name" && !next) {
      cancelEditing();
      return;
    }

    setSavingCell(cellKey);
    try {
      const value = editingCell.field === "format" ? (next || "IN_PERSON") : draftValue;

      const res = await fetch(`/api/classes/${editingCell.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: editingCell.field, value }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to save");
      }

      const data = await res.json();
      const updated = data.class as Partial<Class> & { id: number };
      setAllClasses((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      cancelEditing();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save class");
    } finally {
      setSavingCell(null);
    }
  };

  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return allClasses;
    const q = searchTerm.toLowerCase().trim();
    return allClasses.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const subject = (c.subject || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || subject.includes(q);
    });
  }, [allClasses, searchTerm]);

  if (allClasses.length === 0) {
    return (
      <div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3D4756]">Classes</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-8" style={{ color: "#A1ACBD" }}>
            No classes yet
          </h3>
          <Link
            href="/classes/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#3D4756] text-white p-2 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Class
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#3D4756]">Classes</h2>
        <div className="flex items-center gap-3">
          {savingCell && <span className="text-xs text-gray-500">Saving...</span>}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="w-56 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
          />
          <Link
            className="rounded-md bg-[#3D4756] text-white p-2 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
            href="/classes/new"
            title="Create Class"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="shrink-0 rounded p-1 text-red-600 hover:bg-red-100"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border-x border-t border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm table-fixed" style={{ tableLayout: "fixed" }}>
          <colgroup>
            {columnWidths.map((w, i) => (
              <col key={COLUMN_IDS[i]} style={{ width: w }} />
            ))}
          </colgroup>
          <thead className="bg-white border-b border-gray-200">
            <tr>
              {COLUMN_IDS.map((id, i) => (
                <th
                  key={id}
                  style={{ width: columnWidths[i] }}
                  className="relative px-4 py-2.5 font-semibold text-gray-900"
                >
                  <div className="truncate">
                    {id === "class" ? "Class" : id === "subject" ? "Subject" : id === "year" ? "Year" : id === "rate" ? "Rate" : id === "format" ? "Format" : id === "students" ? "Students" : "Created"}
                  </div>
                  <div
                    role="separator"
                    onMouseDown={startResize(i)}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#3D4756]/20"
                    title="Resize column"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((classItem) => {
              const baseTd = "px-4 py-2 align-middle min-h-[2.25rem] min-w-0";
              const isEditingName = editingCell?.id === classItem.id && editingCell.field === "name";
              const isEditingSubject = editingCell?.id === classItem.id && editingCell.field === "subject";
              const isEditingYear = editingCell?.id === classItem.id && editingCell.field === "year";
              const isEditingRate = editingCell?.id === classItem.id && editingCell.field === "defaultRate";
              const isEditingFormat = editingCell?.id === classItem.id && editingCell.field === "format";

              return (
                <tr key={classItem.id} className="group border-t border-gray-200 hover:bg-gray-50">
                  <td className={`${baseTd} cursor-text`} onClick={() => !isEditingName && startEditing(classItem, "name")}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/classes/${classItem.id}`}
                        className="shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: classItem.color }}
                        />
                      </Link>
                      {isEditingName ? (
                        <input
                          autoFocus
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                          onBlur={() => void saveEditing()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); void saveEditing(); }
                            else if (e.key === "Escape") { e.preventDefault(); cancelEditing(); }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-cell-input w-full min-w-0 flex-1 border-none bg-transparent p-0 text-sm font-medium text-gray-900 outline-none focus:ring-0"
                        />
                      ) : (
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-medium text-gray-900">{classItem.name}</span>
                          {classItem.description && (
                            <span className="block text-xs text-gray-500 truncate">
                              {classItem.description}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={`${baseTd} cursor-text`} onClick={() => !isEditingSubject && startEditing(classItem, "subject")}>
                    {isEditingSubject ? (
                      <input
                        autoFocus
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => void saveEditing()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); void saveEditing(); }
                          else if (e.key === "Escape") { e.preventDefault(); cancelEditing(); }
                        }}
                        className="inline-cell-input w-full min-w-0 border-none bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0"
                      />
                    ) : (
                      <span className="block truncate">{classItem.subject || "—"}</span>
                    )}
                  </td>
                  <td className={`${baseTd} cursor-text`} onClick={() => !isEditingYear && startEditing(classItem, "year")}>
                    {isEditingYear ? (
                      <select
                        autoFocus
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => void saveEditing()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); void saveEditing(); }
                          else if (e.key === "Escape") { e.preventDefault(); cancelEditing(); }
                        }}
                        className="inline-cell-input w-full min-w-0 border-none bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0"
                      >
                        <option value="">—</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{classItem.year ? `Year ${classItem.year}` : "—"}</span>
                    )}
                  </td>
                  <td className={`${baseTd} cursor-text`} onClick={() => !isEditingRate && startEditing(classItem, "defaultRate")}>
                    {isEditingRate ? (
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        min="0"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => void saveEditing()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); void saveEditing(); }
                          else if (e.key === "Escape") { e.preventDefault(); cancelEditing(); }
                        }}
                        className="inline-cell-input w-full min-w-0 border-none bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      <span>{formatRate(classItem.defaultRateCents)}</span>
                    )}
                  </td>
                  <td className={`${baseTd} cursor-text`} onClick={() => !isEditingFormat && startEditing(classItem, "format")}>
                    {isEditingFormat ? (
                      <select
                        autoFocus
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        onBlur={() => void saveEditing()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); void saveEditing(); }
                          else if (e.key === "Escape") { e.preventDefault(); cancelEditing(); }
                        }}
                        className="inline-cell-input w-full min-w-0 border-none bg-transparent p-0 text-sm text-gray-900 outline-none focus:ring-0"
                      >
                        <option value="IN_PERSON">In person</option>
                        <option value="ONLINE">Online</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    ) : (
                      <span>{formatFormat(classItem.format)}</span>
                    )}
                  </td>
                  <td className={`${baseTd} text-gray-900`}>
                    <span className="block truncate">{classItem.students.length}</span>
                  </td>
                  <td className={`${baseTd} text-gray-500`}>
                    <span className="block truncate">{new Date(classItem.createdAt).toLocaleDateString("en-GB")}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
