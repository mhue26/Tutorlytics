"use client";

import { getLessonDisplayTitle } from "@/utils/teachingPeriods";

interface Meeting {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
  status: "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "NEEDS_REVIEW" | "COMPLETED";
  lessonPlan: string | null;
  homework: string | null;
  lessonSummary: string | null;
  nextLessonPrep: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TermLike {
  name: string;
  startDate: Date;
  endDate: Date;
}

interface LessonLogsProps {
  meetings: Meeting[];
  terms?: TermLike[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB');
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getDuration(startTime: Date, endTime: Date): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export default function LessonLogs({ meetings, terms = [] }: LessonLogsProps) {
  const statusPillClass: Record<Meeting["status"], string> = {
    SCHEDULED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    CANCELLED: "bg-red-100 text-red-800",
    NEEDS_REVIEW: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h4 className="font-medium text-gray-900 mb-4">Lesson Logs ({meetings.length})</h4>
      <div className="max-h-96 overflow-y-auto space-y-3">
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No lessons found for the selected period.
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getLessonDisplayTitle(meeting, terms)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {getDuration(meeting.startTime, meeting.endTime)}
                  </div>
                  {meeting.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      {meeting.description}
                    </div>
                  )}
                  {meeting.lessonPlan && (
                    <div className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Plan:</span> {meeting.lessonPlan}
                    </div>
                  )}
                  {meeting.homework && (
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Homework:</span> {meeting.homework}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusPillClass[meeting.status]}`}
                  >
                    {meeting.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
