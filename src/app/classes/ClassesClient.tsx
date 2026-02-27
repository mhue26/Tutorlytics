"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

interface ClassesClientProps {
  classes: Class[];
}

export default function ClassesClient({ classes }: ClassesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredClasses = useMemo(() => {
    if (!searchTerm.trim()) return classes;
    const q = searchTerm.toLowerCase().trim();
    return classes.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const subject = (c.subject || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || subject.includes(q);
    });
  }, [classes, searchTerm]);

  if (classes.length === 0) {
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

      <div className="bg-white rounded-lg border-x border-t border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Class</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Subject</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Year</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Rate</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Format</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Students</th>
              <th className="px-4 py-2.5 font-semibold text-gray-900">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((classItem) => (
              <tr key={classItem.id} className="group border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 align-middle">
                  <Link
                    href={`/classes/${classItem.id}`}
                    className="flex items-center gap-2 text-gray-900 hover:underline"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: classItem.color }}
                    />
                    <div>
                      <span className="font-medium">{classItem.name}</span>
                      {classItem.description && (
                        <span className="block text-xs text-gray-500 truncate max-w-[200px]">
                          {classItem.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-2 align-middle text-gray-900">
                  <span className="block truncate max-w-[220px]">
                    {classItem.subject || "—"}
                  </span>
                </td>
                <td className="px-4 py-2 align-middle text-gray-900">
                  {classItem.year ? `Year ${classItem.year}` : "—"}
                </td>
                <td className="px-4 py-2 align-middle text-gray-900">
                  {formatRate(classItem.defaultRateCents)}
                </td>
                <td className="px-4 py-2 align-middle text-gray-900">
                  {formatFormat(classItem.format)}
                </td>
                <td className="px-4 py-2 align-middle text-gray-900">
                  {classItem.students.length}
                </td>
                <td className="px-4 py-2 align-middle text-gray-500">
                  {new Date(classItem.createdAt).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
