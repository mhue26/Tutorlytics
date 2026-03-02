"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StudentAvatar from "@/app/students/StudentAvatar";

interface LessonRow {
	id: number | string;
	studentId: number | string | null;
	studentFirstName: string;
	studentLastName: string;
	subjects: string;
	isArchived: boolean;
	lessonDate: string;
	lessonTitle: string;
	status: string;
}

interface StudentsTableProps {
	lessons: LessonRow[];
}

type SortField = "date" | "student";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<
	string,
	{
		label: string;
		className: string;
	}
> = {
	COMPLETED: {
		label: "Completed",
		className: "bg-emerald-50 text-emerald-700",
	},
	NEEDS_REVIEW: {
		label: "Needs review",
		className: "bg-amber-50 text-amber-700",
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-red-50 text-red-600",
	},
	IN_PROGRESS: {
		label: "In progress",
		className: "bg-blue-50 text-blue-700",
	},
	SCHEDULED: {
		label: "Scheduled",
		className: "bg-gray-100 text-gray-600",
	},
};

function formatLessonDate(isoStr: string) {
	const d = new Date(isoStr);
	return d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function formatLessonTime(isoStr: string) {
	const d = new Date(isoStr);
	return d.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}

export default function StudentsTable({ lessons }: StudentsTableProps) {
	const [sortField, _setSortField] = useState<SortField>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const toggleSort = () => {
		setSortDir((d) => (d === "asc" ? "desc" : "asc"));
	};

	const sorted = useMemo(() => {
		const rows = [...lessons];
		const dir = sortDir === "asc" ? 1 : -1;
		rows.sort((a, b) => {
			if (sortField === "student") {
				return (
					dir *
					`${a.studentFirstName} ${a.studentLastName}`.localeCompare(
						`${b.studentFirstName} ${b.studentLastName}`,
					)
				);
			}
			return (
				dir *
				(new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime())
			);
		});
		return rows;
	}, [lessons, sortField, sortDir]);

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-base font-semibold text-gray-900">Recent Lessons</h2>
				<div className="flex items-center gap-2">
					<button
						onClick={toggleSort}
						className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
					>
						<svg
							className="w-3.5 h-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
							/>
						</svg>
						Sort by {sortField === "date" ? "Date" : "Student"}
					</button>
					<Link
						href="/calendar"
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
								Lesson
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
								Date
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">
								Time
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3">
								Student
							</th>
							<th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3">
								Status
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{sorted.length === 0 ? (
							<tr>
								<td
									colSpan={4}
									className="py-8 text-center text-sm text-gray-400"
								>
									No past lessons to show yet.
								</td>
							</tr>
						) : (
							sorted.slice(0, 10).map((lesson) => {
								const statusKey = (lesson.status || "").toUpperCase();
								const style =
									STATUS_STYLES[statusKey] ??
									STATUS_STYLES.SCHEDULED;
								return (
									<tr
										key={lesson.id}
										className="group hover:bg-gray-50/50 transition-colors"
									>
										<td className="py-3 pr-4">
											<p className="text-sm font-medium text-gray-900">
												{lesson.lessonTitle}
											</p>
											{lesson.subjects && (
												<p className="mt-0.5 text-xs text-gray-400">
													{lesson.subjects}
												</p>
											)}
										</td>
										<td className="py-3 pr-4">
											<p className="text-xs text-gray-600">
												{formatLessonDate(lesson.lessonDate)}
											</p>
										</td>
										<td className="py-3 pr-4">
											<p className="text-xs text-gray-600">
												{formatLessonTime(lesson.lessonDate)}
											</p>
										</td>
										<td className="py-3">
											<div className="flex items-center gap-3">
												<StudentAvatar
													firstName={lesson.studentFirstName}
													lastName={lesson.studentLastName}
													studentId={Number(lesson.studentId ?? lesson.id)}
													size={32}
												/>
												<div>
													<Link
														href={
															lesson.studentId
																? `/students/${lesson.studentId}`
																: "#"
														}
														className="text-sm font-medium text-gray-900 hover:underline"
													>
														{lesson.studentFirstName}{" "}
														{lesson.studentLastName}
													</Link>
												</div>
											</div>
										</td>
										<td className="py-3">
											<span
												className={`inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full ${style.className}`}
											>
												{style.label}
											</span>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
