"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createMeeting } from '../calendar/actions';
import { pushCalendarUndo } from '../calendar/calendarUndo';
import NiceDatePicker from '../components/NiceDatePicker';
import NiceTimePicker from '../components/NiceTimePicker';
import RepeatOptionsBlock from '../calendar/RepeatOptionsBlock';
import SubjectsMultiSelect from "../students/SubjectsMultiSelect";
import StudentAvatar from "../students/StudentAvatar";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  year?: number | null;
  subjects?: string | null;
}

interface ClassOption {
  id: string;
  name: string;
}

interface TermOption {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  year: number;
}

interface TeacherMember {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  role: "OWNER" | "ADMIN" | "TEACHER";
}

interface ScheduleClientProps {
  students: Student[];
  classes: ClassOption[];
  terms: TermOption[];
  userId: string;
  userRole: "OWNER" | "ADMIN" | "TEACHER";
  teachers: TeacherMember[];
}

export default function ScheduleClient({ students, classes, terms, userId, userRole, teachers }: ScheduleClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<"lesson" | "checkin" | "keydate">("lesson");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [titleDirty, setTitleDirty] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [lessonSubjects, setLessonSubjects] = useState<string>("");
  const [lessonPlan, setLessonPlan] = useState<string>("");
  const [locationMode, setLocationMode] = useState<"in-person" | "online" | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationPlatform, setLocationPlatform] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const current = teachers.find((m) => m.user.id === userId);
    return current?.user.id ?? userId;
  });

  const locationValue =
    locationMode === "in-person" ? locationAddress.trim() : locationMode === "online" ? locationPlatform : "";

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [selectedStudentId, students]
  );

  const studentDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!studentDropdownRef.current) return;
      if (!studentDropdownRef.current.contains(event.target as Node)) {
        setStudentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const defaultLessonTitle = useMemo(() => {
    if (eventType !== "lesson" || !selectedStudent) return "";
    const yearPart = selectedStudent.year ? `Y${selectedStudent.year} ` : "";
    return `${yearPart}${selectedStudent.firstName}'s Lesson`;
  }, [eventType, selectedStudent]);

  /** Parse "HH:mm" or "H:mm" to minutes since midnight; return null if invalid */
  const parseTimeToMinutes = (s: string): number | null => {
    const t = s.trim();
    if (!t) return null;
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59) return null;
    return h * 60 + m;
  };

  const durationHours = useMemo(() => {
    if (eventType !== "lesson" || !startTime || !endTime) return null;
    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (startM == null || endM == null || endM <= startM) return null;
    return (endM - startM) / 60;
  }, [eventType, startTime, endTime]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      return fullName.includes(q);
    });
  }, [students, studentSearch]);

  const handleStudentSelect = (newId: string) => {
    setSelectedStudentId(newId);
    if (!newId) {
      setLessonPlan("");
      return;
    }
    const student = students.find((s) => s.id === newId);
    if (student && eventType === "lesson") {
      const yearPart = student.year ? `Y${student.year} ` : "";
      const autoTitle = `${yearPart}${student.firstName}'s Lesson`;
      if (!titleDirty || title === "" || title === defaultLessonTitle) {
        setTitle(autoTitle);
        setTitleDirty(false);
      }
      // Pre-fill lesson subjects with the student's current subjects
      setLessonSubjects(student.subjects || "");
      void fetch(`/api/students/${newId}/next-lesson-prep`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const suggested = typeof data?.nextLessonPrep === "string" ? data.nextLessonPrep : "";
          setLessonPlan(suggested || "");
        })
        .catch(() => {
          // Ignore prefill failures; user can still type manually.
        });
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const type = (formData.get("eventType") as string) || "lesson";
      const title = (formData.get("title") as string) || "";
      const meetingDate = formData.get("meetingDate") as string | null;
      const startTime = formData.get("startTime") as string | null;
      const _endTime = formData.get("endTime") as string | null;
      const description = (formData.get("description") as string) || "";
      const studentId = formData.get("studentId") as string | null;
      const classId = formData.get("classId") as string | null;
      // Ensure teacherId is always present for lessons/check-ins; fall back to current user.
      if (!formData.get("teacherId")) {
        formData.set("teacherId", selectedTeacherId || userId);
      }

      if (type === "lesson") {
        const result = await createMeeting(formData);
        if (result && "error" in result) {
          throw new Error(result.error);
        }
        if (result && "meetingIds" in result && result.meetingIds?.length) {
          pushCalendarUndo({ type: "create_meeting", payload: { meetingIds: result.meetingIds } });
        }
      } else if (type === "checkin") {
        if (!studentId || !meetingDate || !startTime) {
          throw new Error("Student, date, and start time are required for a check-in.");
        }

        const scheduledDate = `${meetingDate}T${startTime}`;

        await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            scheduledDate,
            notes: description || null,
          }),
        });
      } else if (type === "keydate") {
        if (!title || !meetingDate) {
          throw new Error("Title and date are required for an event.");
        }

        await fetch("/api/key-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            date: meetingDate,
            description: description || null,
            scope: classId ? "CLASS" : "ORGANISATION",
            classId: classId || null,
          }),
        });
      }

      router.push("/calendar");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-[#3D4756]">Create Event</h1>
          </div>
          <button
            type="submit"
            form="meeting-form"
            className="px-6 py-2 rounded-lg bg-[#3D4756] text-white shadow-sm hover:bg-[#2A3441] focus:outline-none focus:ring-2 focus:ring-[#3D4756]/40 focus:ring-offset-2 transition-colors"
          >
            Save
          </button>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form id="meeting-form" action={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleDirty(true);
                }}
                onFocus={() => {
                  if (!titleDirty && defaultLessonTitle && title === defaultLessonTitle) {
                    setTitle("");
                  }
                }}
                className={`w-full text-2xl font-medium border-none outline-none placeholder-gray-400 ${
                  !titleDirty && title === defaultLessonTitle ? "text-gray-400" : "text-gray-900"
                }`}
                placeholder="Add title"
              />
            </div>

            {/* Event type selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Type</span>
              <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
                {[
                  { id: "lesson", label: "Lesson" },
                  { id: "checkin", label: "Check-in" },
                  { id: "keydate", label: "Event" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setEventType(option.id as typeof eventType)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      eventType === option.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <input type="hidden" name="eventType" value={eventType} />

            {/* Date and Time Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center">
                <NiceDatePicker
                  name="meetingDate"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </div>

              {eventType !== "keydate" && (
                <div className="flex items-center gap-2 min-w-[260px]">
                  {eventType === "lesson" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <NiceTimePicker name="startTime" />
                      <span className="text-gray-500">to</span>
                      <NiceTimePicker name="endTime" />
                    </>
                  )}
                </div>
              )}

            </div>

            {/* Repeat (lessons only) – immediately under date section */}
            {eventType === "lesson" && (
              <div className="mt-3">
                <RepeatOptionsBlock terms={terms} />
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
                {/* Location (lessons only): In-Person or Online, no default */}
                {eventType === "lesson" && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <div className="flex-1 space-y-3">
                      <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setLocationMode("in-person")}
                          className={`px-3 py-1 rounded-full font-medium transition-colors ${
                            locationMode === "in-person"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          In-Person
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationMode("online")}
                          className={`px-3 py-1 rounded-full font-medium transition-colors ${
                            locationMode === "online"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Online
                        </button>
                      </div>
                      {locationMode === "in-person" && (
                        <input
                          type="text"
                          value={locationAddress}
                          onChange={(e) => setLocationAddress(e.target.value)}
                          placeholder="Enter address"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                        />
                      )}
                      {locationMode === "online" && (
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
                      )}
                      <input type="hidden" name="location" value={locationValue} />
                    </div>
                  </div>
                )}

                {/* Teacher selection (for multi-teacher workspaces) */}
                {eventType !== "keydate" && teachers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1 space-y-1">
                      <span className="block text-sm text-gray-600">Teacher</span>
                      {userRole === "TEACHER" ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {(() => {
                              const current = teachers.find((m) => m.user.id === userId);
                              return current?.user.name || current?.user.email || "You";
                            })()}
                          </div>
                          <input type="hidden" name="teacherId" value={userId} />
                        </>
                      ) : (
                        <select
                          name="teacherId"
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                        >
                          {teachers.map((m) => (
                            <option key={m.user.id} value={m.user.id}>
                              {(m.user.name || m.user.email || "Unnamed user") + ` (${m.role})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {/* Student Selection (lessons and check-ins) */}
                {eventType !== "keydate" && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="relative flex-1" ref={studentDropdownRef}>
                      <input
                        type="hidden"
                        name="studentId"
                        value={selectedStudentId}
                        required
                      />
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#3D4756]/20 focus-within:border-[#3D4756]">
                        {selectedStudent && !studentDropdownOpen && (
                          <StudentAvatar
                            firstName={selectedStudent.firstName}
                            lastName={selectedStudent.lastName}
                            studentId={Number(selectedStudent.id)}
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
                            if (selectedStudentId) {
                              if (v.trim() === "") {
                                setSelectedStudentId("");
                              } else {
                                const full = `${selectedStudent?.firstName ?? ""} ${selectedStudent?.lastName ?? ""}`.toLowerCase();
                                if (!full.startsWith(v.toLowerCase().trim())) {
                                  setSelectedStudentId("");
                                }
                              }
                            }
                            setStudentDropdownOpen(true);
                          }}
                          onFocus={() => {
                            setStudentDropdownOpen(true);
                            if (selectedStudent && studentSearch === "") {
                              setStudentSearch(`${selectedStudent.firstName} ${selectedStudent.lastName}`);
                            }
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
                              filteredStudents.map((student) => (
                                <li key={student.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleStudentSelect(student.id);
                                      setStudentDropdownOpen(false);
                                      setStudentSearch("");
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <StudentAvatar
                                      firstName={student.firstName}
                                      lastName={student.lastName}
                                      studentId={Number(student.id)}
                                      link={false}
                                      size={32}
                                    />
                                    <span className="text-sm text-gray-900">
                                      {student.firstName} {student.lastName}
                                    </span>
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Lesson subjects (for lessons only) */}
                {eventType === "lesson" && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13M12 6.253C10.832 5.477 9.546 5 8.25 5 6.954 5 5.668 5.477 4.5 6.253v13C5.668 18.477 6.954 18 8.25 18c1.296 0 2.582.477 3.75 1.253M12 6.253C13.168 5.477 14.454 5 15.75 5c1.296 0 2.582.477 3.75 1.253v13C18.332 18.477 17.046 18 15.75 18c-1.296 0-2.582.477-3.75 1.253"
                      />
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
                )}

                {eventType === "lesson" && (
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                    <div className="flex-1 space-y-2">
                      <span className="text-sm text-gray-600">Lesson plan</span>
                      <textarea
                        name="lessonPlan"
                        value={lessonPlan}
                        onChange={(e) => setLessonPlan(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                        placeholder="Outline what you'll cover in this lesson..."
                      />
                    </div>
                  </div>
                )}

                {/* Billing (lessons only): hourly rate and total, auto-calc from duration */}
                {eventType === "lesson" && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm text-gray-600 mb-1">Hourly rate</label>
                        <input
                          id="hourlyRate"
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={hourlyRate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setHourlyRate(val);
                            const v = parseFloat(val);
                            if (!Number.isNaN(v) && durationHours != null && durationHours > 0) {
                              setTotal((v * durationHours).toFixed(2));
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                        />
                      </div>
                      <div>
                        <label htmlFor="total" className="block text-sm text-gray-600 mb-1">Total</label>
                        <input
                          id="total"
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={total}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTotal(val);
                            const v = parseFloat(val);
                            if (!Number.isNaN(v) && durationHours != null && durationHours > 0) {
                              setHourlyRate((v / durationHours).toFixed(2));
                            }
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                        />
                      </div>
                    </div>
                    <input type="hidden" name="hourlyRateCents" value={hourlyRate && !Number.isNaN(parseFloat(hourlyRate)) ? String(Math.round(parseFloat(hourlyRate) * 100)) : ""} />
                    <input type="hidden" name="totalCents" value={total && !Number.isNaN(parseFloat(total)) ? String(Math.round(parseFloat(total) * 100)) : ""} />
                  </div>
                )}

                {/* Key date scope (optional class) */}
                {eventType === "keydate" && classes.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                    <select
                      name="classId"
                      className="flex-1 border-none outline-none text-sm bg-transparent"
                    >
                      <option value="">Organisation-wide</option>
                      {classes.map((klass) => (
                        <option key={klass.id} value={klass.id}>
                          {klass.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <div className="flex-1 space-y-2">
                    <span className="text-sm text-gray-600">Description</span>
                    <textarea
                      name="description"
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D4756]/20 focus:border-[#3D4756]"
                      placeholder="Add description or notes for this event..."
                    />
                  </div>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
