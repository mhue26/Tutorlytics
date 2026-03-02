"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NiceDatePicker from "@/app/components/NiceDatePicker";
import NiceTimePicker from "@/app/components/NiceTimePicker";
import SubjectsMultiSelect from "@/app/students/SubjectsMultiSelect";
import StudentAvatar from "@/app/students/StudentAvatar";
import { pushCalendarUndo } from "@/app/calendar/calendarUndo";

interface Student {
	id: number;
	firstName: string;
	lastName: string;
	year?: number | null;
	subjects?: string | null;
}

interface InitialData {
	id: number;
	title: string;
	description: string;
	studentId: string;
	meetingDate: string;
	startTime: string;
	endTime: string;
	isCompleted: boolean;
	meetingLocation: string;
	lessonSubjects: string;
	status: "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "NEEDS_REVIEW" | "COMPLETED";
	lessonPlan: string;
	homework: string;
	lessonSummary: string;
	nextLessonPrep: string;
	cancelReason: string;
	locationMode: "in-person" | "online" | null;
	locationAddress: string;
	locationPlatform: string;
	recurrenceSeriesId: string | null;
	recurrenceIndex: number | null;
}

interface LessonEditClientProps {
	meetingId: number;
	initial: InitialData;
	students: Student[];
}

export default function LessonEditClient({
	meetingId,
	initial,
	students,
}: LessonEditClientProps) {
	const router = useRouter();
	const [title, setTitle] = useState(initial.title);
	const [description, setDescription] = useState(initial.description);
	const [studentId, setStudentId] = useState(initial.studentId);
	const [meetingDate, setMeetingDate] = useState(initial.meetingDate);
	const [startTime, setStartTime] = useState(initial.startTime);
	const [endTime, setEndTime] = useState(initial.endTime);
	const [locationMode, setLocationMode] = useState<"in-person" | "online" | null>(initial.locationMode);
	const [locationAddress, setLocationAddress] = useState(initial.locationAddress);
	const [locationPlatform, setLocationPlatform] = useState(initial.locationPlatform);
	const [lessonSubjects, setLessonSubjects] = useState(initial.lessonSubjects);
	const [status, setStatus] = useState(initial.status);
	const [lessonPlan, setLessonPlan] = useState(initial.lessonPlan);
	const [homework, setHomework] = useState(initial.homework);
	const [lessonSummary, setLessonSummary] = useState(initial.lessonSummary);
	const [nextLessonPrep, setNextLessonPrep] = useState(initial.nextLessonPrep);
	const [cancelReason, setCancelReason] = useState(initial.cancelReason);
	const [scope, setScope] = useState<"this" | "all" | "future">("this");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
	const [studentSearch, setStudentSearch] = useState("");
	const studentDropdownRef = useRef<HTMLDivElement>(null);

	const isRecurring = initial.recurrenceSeriesId != null;
	const selectedStudent = useMemo(
		() => students.find((s) => String(s.id) === studentId) ?? null,
		[studentId, students]
	);

	const filteredStudents = useMemo(() => {
		const q = studentSearch.trim().toLowerCase();
		if (!q) return students;
		return students.filter((s) => {
			const full = `${s.firstName} ${s.lastName}`.toLowerCase();
			return full.includes(q);
		});
	}, [students, studentSearch]);

	useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
				setStudentDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	const saveLesson = async (completeReview = false) => {
		setError(null);
		setSaving(true);
		try {
			const startDateTime = new Date(`${meetingDate}T${startTime}`);
			const endDateTime = new Date(`${meetingDate}T${endTime}`);
			const locationValue =
				locationMode === "in-person" ? locationAddress.trim() : locationMode === "online" ? locationPlatform : "";
			const nextStatus = completeReview ? "COMPLETED" : status;
			const res = await fetch(`/api/meetings/${meetingId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					description: description || null,
					studentId: parseInt(studentId, 10),
					startTime: startDateTime.toISOString(),
					endTime: endDateTime.toISOString(),
					status: nextStatus,
					meetingLocation: locationValue || null,
					lessonPlan: lessonPlan || null,
					homework: homework || null,
					lessonSummary: lessonSummary || null,
					nextLessonPrep: nextLessonPrep || null,
					cancelReason: cancelReason || null,
					scope: isRecurring ? scope : "this",
				}),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Failed to update");
			}
			// Push undo entry when editing a single meeting (this event only, or non-recurring)
			if (scope === "this" || !isRecurring) {
				const meetingLocation =
					initial.locationMode === "in-person"
						? initial.locationAddress
						: initial.locationMode === "online"
							? initial.locationPlatform
							: null;
				pushCalendarUndo({
					type: "update_meeting",
					payload: {
						meetingId,
						previousState: {
							title: initial.title,
							description: initial.description || null,
							startTime: new Date(`${initial.meetingDate}T${initial.startTime}`).toISOString(),
							endTime: new Date(`${initial.meetingDate}T${initial.endTime}`).toISOString(),
							status: initial.status,
							isCompleted: initial.isCompleted,
							meetingLocation: meetingLocation || null,
							lessonPlan: initial.lessonPlan || null,
							homework: initial.homework || null,
							lessonSummary: initial.lessonSummary || null,
							nextLessonPrep: initial.nextLessonPrep || null,
							cancelReason: initial.cancelReason || null,
							studentId: parseInt(initial.studentId, 10),
						},
					},
				});
			}
			router.push(`/calendar/event/lesson/${meetingId}`);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update");
		} finally {
			setSaving(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		void saveLesson(false);
	};

	const canEditPlan = status === "SCHEDULED" || status === "IN_PROGRESS" || status === "NEEDS_REVIEW";
	const canEditReview = status === "NEEDS_REVIEW";
	const isReadOnlyReview = status === "COMPLETED";
	const isReviewingTab = status === "IN_PROGRESS" || status === "NEEDS_REVIEW";

	return (
		<div className="min-h-screen py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => router.push(`/calendar/event/lesson/${meetingId}`)}
							className="text-gray-400 hover:text-gray-600 p-1"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<h1 className="text-2xl font-semibold text-[#3D4756]">
							{isReviewingTab ? "Review Lesson" : "Edit Event"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						{(status === "NEEDS_REVIEW" || status === "IN_PROGRESS") && (
							<button
								type="button"
								disabled={saving}
								onClick={() => void saveLesson(true)}
								className="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-colors disabled:opacity-50"
							>
								Complete review
							</button>
						)}
						<button
							type="submit"
							form="lesson-edit-form"
							disabled={saving}
							className="px-6 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] focus:outline-none focus:ring-2 focus:ring-[#3D4756] focus:ring-offset-2 transition-colors disabled:opacity-50"
						>
							{saving ? "Saving…" : "Save"}
						</button>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-xl p-6">
					<form id="lesson-edit-form" onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
						)}

						{!isReviewingTab && (
							<>
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
										<span className="px-3 py-1 rounded-full font-medium bg-white text-gray-900 shadow-sm">
											Lesson
										</span>
										<span className="px-3 py-1 text-gray-600 cursor-default">Check-in</span>
										<span className="px-3 py-1 text-gray-600 cursor-default">Event</span>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-600">Status</span>
									<select
										value={status}
										onChange={(e) =>
											setStatus(
												e.target.value as
													| "SCHEDULED"
													| "IN_PROGRESS"
													| "CANCELLED"
													| "NEEDS_REVIEW"
													| "COMPLETED"
											)
										}
										className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
									>
										<option value="SCHEDULED">Scheduled</option>
										<option value="IN_PROGRESS">In progress</option>
										<option value="CANCELLED">Cancelled</option>
										<option value="NEEDS_REVIEW">Needs review</option>
										<option value="COMPLETED">Completed</option>
									</select>
								</div>

								<div className="flex items-center gap-4 flex-wrap">
									<div className="flex items-center">
										<NiceDatePicker
											name="meetingDate"
											value={meetingDate}
											onChange={setMeetingDate}
										/>
									</div>
									<div className="flex items-center gap-2 min-w-[260px]">
										<NiceTimePicker
											name="startTime"
											value={startTime}
											onChange={setStartTime}
										/>
										<span className="text-gray-500">to</span>
										<NiceTimePicker
											name="endTime"
											value={endTime}
											onChange={setEndTime}
										/>
									</div>
									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											id="allDay"
											className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											disabled
										/>
										<label htmlFor="allDay" className="text-sm text-gray-700">All day</label>
									</div>
								</div>
							</>
						)}

						{isRecurring && (
							<div className="rounded-lg border border-gray-200 p-4 bg-gray-50/50">
								<div className="text-sm font-medium text-gray-700 mb-2">Apply changes to</div>
								<div className="flex gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="scope"
											checked={scope === "this"}
											onChange={() => setScope("this")}
											className="h-4 w-4 text-blue-600 border-gray-300"
										/>
										<span className="text-sm text-gray-700">Just this event</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="scope"
											checked={scope === "all"}
											onChange={() => setScope("all")}
											className="h-4 w-4 text-blue-600 border-gray-300"
										/>
										<span className="text-sm text-gray-700">All events in this series</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="scope"
											checked={scope === "future"}
											onChange={() => setScope("future")}
											className="h-4 w-4 text-blue-600 border-gray-300"
										/>
										<span className="text-sm text-gray-700">This and all future events</span>
									</label>
								</div>
							</div>
						)}

						{!isReviewingTab && (
							<>
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										<div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
											<button
												type="button"
												onClick={() => setLocationMode("in-person")}
												className={`px-3 py-1 rounded-full font-medium transition-colors ${
													locationMode === "in-person" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
												}`}
											>
												In-Person
											</button>
											<button
												type="button"
												onClick={() => setLocationMode("online")}
												className={`px-3 py-1 rounded-full font-medium transition-colors ${
													locationMode === "online" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
												}`}
											>
												Online
											</button>
										</div>
									</div>
									{locationMode === "in-person" && (
										<div className="pl-8">
											<input
												type="text"
												value={locationAddress}
												onChange={(e) => setLocationAddress(e.target.value)}
												placeholder="Enter address"
												className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
											/>
										</div>
									)}
									{locationMode === "online" && (
										<div className="pl-8">
											<select
												value={locationPlatform}
												onChange={(e) => setLocationPlatform(e.target.value)}
												className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
											>
												<option value="">Select platform</option>
												<option value="Zoom">Zoom</option>
												<option value="Google Meet">Google Meet</option>
												<option value="Microsoft Teams">Microsoft Teams</option>
												<option value="Webex">Webex</option>
											</select>
										</div>
									)}
								</div>

								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<div className="relative flex-1" ref={studentDropdownRef}>
										<div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#3D4756]/20 focus-within:border-[#3D4756]">
											{selectedStudent && !studentDropdownOpen && (
												<StudentAvatar
													firstName={selectedStudent.firstName}
													lastName={selectedStudent.lastName}
													studentId={selectedStudent.id}
													link={false}
													size={28}
												/>
											)}
											<input
												type="text"
												value={
													selectedStudent && !studentDropdownOpen
														? `${selectedStudent.firstName} ${selectedStudent.lastName}`
														: studentSearch
												}
												onChange={(e) => {
													const v = e.target.value;
													setStudentSearch(v);
													if (studentId) {
														if (v.trim() === "") setStudentId("");
														else {
															const full = `${selectedStudent?.firstName ?? ""} ${selectedStudent?.lastName ?? ""}`.toLowerCase();
															if (!full.startsWith(v.toLowerCase().trim())) setStudentId("");
														}
													}
													setStudentDropdownOpen(true);
												}}
												onFocus={() => {
													setStudentDropdownOpen(true);
													if (selectedStudent && studentSearch === "")
														setStudentSearch(`${selectedStudent.firstName} ${selectedStudent.lastName}`);
												}}
												placeholder="Select a student"
												className="flex-1 min-w-0 border-none bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
											/>
										</div>
										{studentDropdownOpen && (
											<div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
												<ul className="max-h-64 overflow-auto py-1">
													{filteredStudents.length === 0 ? (
														<li className="px-3 py-2 text-sm text-gray-500">No students found</li>
													) : (
														filteredStudents.map((s) => (
															<li key={s.id}>
																<button
																	type="button"
																	onClick={() => {
																		setStudentId(String(s.id));
																		setStudentDropdownOpen(false);
																		setStudentSearch("");
																	}}
																	className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
																>
																	<StudentAvatar firstName={s.firstName} lastName={s.lastName} studentId={s.id} link={false} size={32} />
																	<span className="text-sm text-gray-900">{s.firstName} {s.lastName}</span>
																</button>
															</li>
														))
													)}
												</ul>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
									</svg>
									<div className="flex-1">
										<div className="text-sm text-gray-600 mb-1">Lesson subjects</div>
										<SubjectsMultiSelect
											name="lessonSubjects"
											value={lessonSubjects}
											onChange={setLessonSubjects}
											compact
										/>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
										</svg>
										<span className="text-sm text-gray-600">Description</span>
									</div>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={4}
										className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
										placeholder="Add description or notes for this event..."
									/>
								</div>
							</>
						)}

						<div className="space-y-2">
							<div className="text-sm text-gray-600">Lesson plan</div>
							<textarea
								value={lessonPlan}
								onChange={(e) => setLessonPlan(e.target.value)}
								rows={3}
								disabled={!canEditPlan}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] disabled:bg-gray-50 disabled:text-gray-500"
								placeholder="Outline what will be covered in this lesson."
							/>
						</div>

						<div className="space-y-2">
							<div className="text-sm text-gray-600">Homework</div>
							<textarea
								value={homework}
								onChange={(e) => setHomework(e.target.value)}
								rows={3}
								disabled={!canEditPlan}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] disabled:bg-gray-50 disabled:text-gray-500"
								placeholder="Any homework assigned to the student."
							/>
						</div>

						<div className="space-y-2">
							<div className="text-sm text-gray-600">Lesson summary</div>
							<textarea
								value={lessonSummary}
								onChange={(e) => setLessonSummary(e.target.value)}
								rows={3}
								disabled={!canEditReview && !isReadOnlyReview}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] disabled:bg-gray-50 disabled:text-gray-500"
								placeholder="After the lesson, confirm what was covered."
							/>
						</div>

						<div className="space-y-2">
							<div className="text-sm text-gray-600">Next lesson prep</div>
							<textarea
								value={nextLessonPrep}
								onChange={(e) => setNextLessonPrep(e.target.value)}
								rows={3}
								disabled={!canEditReview && !isReadOnlyReview}
								className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756] disabled:bg-gray-50 disabled:text-gray-500"
								placeholder="Work prepared for the following lesson."
							/>
						</div>

						{status === "CANCELLED" && (
							<div className="space-y-2">
								<div className="text-sm text-gray-600">Cancellation reason</div>
								<textarea
									value={cancelReason}
									onChange={(e) => setCancelReason(e.target.value)}
									rows={2}
									className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
									placeholder="Optional reason for cancellation."
								/>
							</div>
						)}
					</form>
				</div>
			</div>
		</div>
	);
}
