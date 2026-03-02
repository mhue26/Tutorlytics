"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import StudentAvatar from "@/app/students/StudentAvatar";

interface StudentRow {
	id: number;
	firstName: string;
	lastName: string;
	subjects: string;
	isArchived: boolean;
	nextLessonDate: string | null;
	nextLessonTitle: string | null;
}

interface StudentsTableProps {
	students: StudentRow[];
}

type SortField = "name" | "nextLesson" | "status";
type SortDir = "asc" | "desc";

export default function StudentsTable({ students }: StudentsTableProps) {
	const [sortField, setSortField] = useState<SortField>("nextLesson");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">("all");
	const [showFilters, setShowFilters] = useState(false);

	const toggleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("asc");
		}
	};

	const filtered = useMemo(() => {
		let rows = [...students];
		if (filterStatus === "active") rows = rows.filter((s) => !s.isArchived);
		if (filterStatus === "archived") rows = rows.filter((s) => s.isArchived);
		return rows;
	}, [students, filterStatus]);

	const sorted = useMemo(() => {
		const rows = [...filtered];
		const dir = sortDir === "asc" ? 1 : -1;
		rows.sort((a, b) => {
			switch (sortField) {
				case "name":
					return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
				case "nextLesson": {
					if (!a.nextLessonDate && !b.nextLessonDate) return 0;
					if (!a.nextLessonDate) return 1;
					if (!b.nextLessonDate) return -1;
					return dir * (new Date(a.nextLessonDate).getTime() - new Date(b.nextLessonDate).getTime());
				}
				case "status":
					return dir * (Number(a.isArchived) - Number(b.isArchived));
				default:
					return 0;
			}
		});
		return rows;
	}, [filtered, sortField, sortDir]);

	function formatLessonDate(isoStr: string | null) {
		if (!isoStr) return null;
		const d = new Date(isoStr);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const eventDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		if (eventDate.getTime() === today.getTime()) return "Today";
		if (eventDate.getTime() === tomorrow.getTime()) return "Tomorrow";
		return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
	}

	function formatLessonTime(isoStr: string | null) {
		if (!isoStr) return "";
		return new Date(isoStr).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	}

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-base font-semibold text-gray-900">Students with Upcoming Lessons</h2>
				<div className="flex items-center gap-2">
					<button
						onClick={() => toggleSort(sortField === "name" ? "nextLesson" : "name")}
						className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
						</svg>
						Sort
					</button>
					<div className="relative">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`flex items-center gap-1.5 text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors ${
								filterStatus !== "all"
									? "text-blue-700 border-blue-200 bg-blue-50"
									: "text-gray-600 border-gray-200 hover:bg-gray-50"
							}`}
						>
							<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
							</svg>
							Filter
						</button>
						{showFilters && (
							<div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[140px]">
								{(["all", "active", "archived"] as const).map((status) => (
									<button
										key={status}
										onClick={() => {
											setFilterStatus(status);
											setShowFilters(false);
										}}
										className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
											filterStatus === status
												? "bg-gray-100 text-gray-900 font-medium"
												: "text-gray-600 hover:bg-gray-50"
										}`}
									>
										{status === "all" ? "All Students" : status === "active" ? "Active" : "Archived"}
									</button>
								))}
							</div>
						)}
					</div>
					<Link
						href="/students"
						className="text-xs font-medium text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
					>
						See All
					</Link>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-100">
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
								Student Name
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
								Next Lesson
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
								Subjects
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3">
								Status
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{sorted.length === 0 ? (
							<tr>
								<td colSpan={4} className="py-8 text-center text-sm text-gray-400">
									No students match the current filters.
								</td>
							</tr>
						) : (
							sorted.slice(0, 8).map((student) => (
								<tr key={student.id} className="group hover:bg-gray-50/50 transition-colors">
									<td className="py-3 pr-4">
										<div className="flex items-center gap-3">
											<StudentAvatar
												firstName={student.firstName}
												lastName={student.lastName}
												studentId={student.id}
												size={36}
											/>
											<div>
												<Link
													href={`/students/${student.id}`}
													className="text-sm font-medium text-gray-900 hover:underline"
												>
													{student.firstName} {student.lastName}
												</Link>
											</div>
										</div>
									</td>
									<td className="py-3 pr-4">
										{student.nextLessonDate ? (
											<div>
												<p className="text-sm text-gray-800">
													{student.nextLessonTitle || "Lesson"}
												</p>
												<p className="text-xs text-gray-500">
													{formatLessonDate(student.nextLessonDate)} at {formatLessonTime(student.nextLessonDate)}
												</p>
											</div>
										) : (
											<span className="text-xs text-gray-400">No upcoming</span>
										)}
									</td>
									<td className="py-3 pr-4">
										{student.subjects ? (
											<div className="flex flex-wrap gap-1">
												{student.subjects
													.split(",")
													.slice(0, 3)
													.map((s, i) => (
														<span
															key={i}
															className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
														>
															{s.trim()}
														</span>
													))}
											</div>
										) : (
											<span className="text-xs text-gray-400">-</span>
										)}
									</td>
									<td className="py-3">
										<span
											className={`inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full ${
												student.isArchived
													? "bg-gray-100 text-gray-500"
													: "bg-emerald-50 text-emerald-700"
											}`}
										>
											{student.isArchived ? "Archived" : "Active"}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
