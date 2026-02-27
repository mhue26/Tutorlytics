"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMeeting } from '../calendar/actions';
import NiceDatePicker from '../components/NiceDatePicker';
import NiceTimePicker from '../components/NiceTimePicker';
import SubjectsMultiSelect from "../students/SubjectsMultiSelect";

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

interface ScheduleClientProps {
  students: Student[];
  classes: ClassOption[];
  userId: string;
}

export default function ScheduleClient({ students, classes, userId }: ScheduleClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState<"lesson" | "checkin" | "keydate">("lesson");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [titleDirty, setTitleDirty] = useState(false);
  const [lessonSubjects, setLessonSubjects] = useState<string>("");

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [selectedStudentId, students]
  );

  const defaultLessonTitle = useMemo(() => {
    if (eventType !== "lesson" || !selectedStudent) return "";
    const yearPart = selectedStudent.year ? `Y${selectedStudent.year} ` : "";
    return `${yearPart}${selectedStudent.firstName}'s Lesson`;
  }, [eventType, selectedStudent]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const type = (formData.get("eventType") as string) || "lesson";
      const title = (formData.get("title") as string) || "";
      const meetingDate = formData.get("meetingDate") as string | null;
      const startTime = formData.get("startTime") as string | null;
      const endTime = formData.get("endTime") as string | null;
      const description = (formData.get("description") as string) || "";
      const studentId = formData.get("studentId") as string | null;
      const classId = formData.get("classId") as string | null;

      if (type === "lesson") {
        await createMeeting(formData);
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
          throw new Error("Title and date are required for a key date.");
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                  { id: "keydate", label: "Key date" },
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
                  <NiceTimePicker name="startTime" />
                  <span className="text-gray-500">to</span>
                  <NiceTimePicker name="endTime" />
                </div>
              )}

              {eventType === "lesson" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allDay" className="text-sm text-gray-700">All day</label>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Location */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <input
                    type="text"
                    name="location"
                    placeholder="Add location"
                    className="flex-1 border-none outline-none text-sm"
                  />
                </div>

                {/* Student Selection (lessons and check-ins) */}
                {eventType !== "keydate" && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <select
                      name="studentId"
                      required={eventType !== "keydate"}
                      className="flex-1 border-none outline-none text-sm bg-transparent"
                      value={selectedStudentId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedStudentId(newId);
                        if (!newId) return;
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
                        }
                      }}
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Lesson subjects (for lessons only) */}
                {eventType === "lesson" && (
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
                )}

                {/* Key date scope (optional class) */}
                {eventType === "keydate" && classes.length > 0 && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <div className="flex gap-1">
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M6 12h12M6 18h12" />
                        </svg>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2" />
                        </svg>
                      </button>
                    </div>
                    <button type="button" className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Create meeting notes
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full border-none outline-none resize-none text-sm"
                    placeholder="Add description"
                  />
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
