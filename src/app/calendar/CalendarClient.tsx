"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CalendarNavigation from "./CalendarNavigation";
import CalendarGrid from "./CalendarGrid";
import CalendarTimeGrid from "./CalendarTimeGrid";
import TeachingPeriodsModal from "./TermsHolidaysModal";
import { useModal } from "../contexts/ModalContext";
import type { CalendarEventDTO } from "./getCalendarEvents";

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
  student: Student;
}

interface CalendarClientProps {
  meetings: Meeting[];
  upcomingMeetings: Meeting[];
  currentYear: number;
  currentMonth: number;
  calendarEvents: CalendarEventDTO[];
  initialView?: "month" | "week" | "fiveday" | "threeday" | "day";
  students: Student[];
  createMeeting: (formData: FormData) => Promise<void>;
  userId: string;
}

export default function CalendarClient({ 
  meetings, 
  upcomingMeetings, 
  currentYear, 
  currentMonth, 
  calendarEvents,
  initialView = "month",
  students,
  createMeeting,
  userId
}: CalendarClientProps) {
  type CalendarView = "month" | "week" | "fiveday" | "threeday" | "day";

  const [view, setView] = useState<CalendarView>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date(currentYear, currentMonth, 1);
  });
  const [timeRange, setTimeRange] = useState<string>('week');
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [teachingPeriods, setTeachingPeriods] = useState<any[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { setModalType } = useModal();

  const loadCurrentTerm = async () => {
    try {
      const [termsResponse, holidaysResponse] = await Promise.all([
        fetch(`/api/terms`),
        fetch(`/api/holidays`)
      ]);
      
      const terms = termsResponse.ok ? await termsResponse.json() : [];
      const holidays = holidaysResponse.ok ? await holidaysResponse.json() : [];
      
      // Combine all teaching periods
      const allPeriods = [
        ...terms.map((term: any) => ({ ...term, type: 'term' as const })),
        ...holidays.map((holiday: any) => ({ ...holiday, type: 'holiday' as const }))
      ];
      
      setTeachingPeriods(allPeriods);
      
      const today = new Date();
      
      // Find current active term
      const activeTerm = terms.find((term: any) => {
        const startDate = new Date(term.startDate);
        const endDate = new Date(term.endDate);
        return today >= startDate && today <= endDate && term.isActive;
      });
      
      if (activeTerm) {
        setCurrentTerm(activeTerm);
        // Calculate current week
        const startDate = new Date(activeTerm.startDate);
        const diffTime = today.getTime() - startDate.getTime();
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        setCurrentWeek(Math.max(1, diffWeeks));
      }
    } catch (error) {
      console.error('Error loading current term:', error);
    }
  };

  useEffect(() => {
    loadCurrentTerm();
  }, [userId]);

  // Reload teaching periods when component becomes visible again or when window regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCurrentTerm();
      }
    };

    const handleFocus = () => {
      loadCurrentTerm();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatMeetingDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const meetingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (meetingDate.getTime() === todayDate.getTime()) {
      return "Today";
    } else if (meetingDate.getTime() === tomorrowDate.getTime()) {
      return "Tomorrow";
    } else {
      return new Date(date).toLocaleDateString('en-GB', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };


  const getFilteredMeetings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let endDate: Date;
    
    switch (timeRange) {
      case 'today':
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'tomorrow':
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 2);
        break;
      case 'week':
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'month':
        endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default:
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);
    }
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate >= today && meetingDate < endDate;
    });
  };

  return (
    <>
      <div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#3D4756]">Calendar</h2>
          {currentTerm && (
            <div className="flex items-center rounded-full px-4 py-2 shadow-sm" style={{ backgroundColor: '#FEF5eF' }}>
              <span className="text-base font-medium" style={{ color: '#584b53' }}>{currentTerm.name}</span>
              {currentWeek && (
                <span className="ml-2 text-base" style={{ color: '#584b53' }}>• Week {currentWeek}</span>
              )}
            </div>
          )}
        </div>

        {/* Current Status on main calendar page */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Current Status</h3>
          {currentTerm ? (
            <div className="text-blue-800">
              <p><strong>Current Term:</strong> {currentTerm.name}</p>
              {currentWeek && (
                <p>
                  <strong>Week:</strong>{" "}
                  {currentWeek} of{" "}
                  {Math.ceil(
                    (new Date(currentTerm.endDate).getTime() -
                      new Date(currentTerm.startDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 7)
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-blue-800">
              No active term found for current date.{" "}
              <button
                type="button"
                onClick={() => {
                  setShowTermsModal(true);
                  setModalType('teachingPeriods');
                }}
                className="text-blue-800 font-medium"
              >
                Add teaching term <span className="underline">here</span>
              </button>
            </p>
          )}
        </div>

        {/* Main Calendar Content */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Upcoming</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">Next Week</option>
                <option value="month">Next Month</option>
              </select>
            </div>
            {getFilteredMeetings().length === 0 ? (
              <p className="text-gray-500">No upcoming events scheduled.</p>
            ) : (
              <div className="space-y-3">
                {getFilteredMeetings().map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <div>
                      <div className="font-medium">{meeting.title}</div>
                      <div className="text-sm text-gray-600">
                        with {meeting.student.firstName} {meeting.student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatMeetingDate(new Date(meeting.startTime))} at {formatTime(new Date(meeting.startTime))}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {meeting.isCompleted ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar View */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <CalendarNavigation
              userId={userId}
              view={view}
              currentDate={currentDate}
              onViewChange={setView}
              onDateChange={setCurrentDate}
            />

            {view === "month" ? (
              <CalendarGrid 
                meetings={meetings} 
                currentYear={currentYear} 
                currentMonth={currentMonth}
                teachingPeriods={teachingPeriods}
                calendarEvents={calendarEvents}
              />
            ) : (
              <CalendarTimeGrid
                meetings={meetings}
                currentDate={currentDate}
                view={view as "week" | "fiveday" | "threeday" | "day"}
                calendarEvents={calendarEvents}
              />
            )}
          </div>
        </div>
      </div>

      {userId && (
        <TeachingPeriodsModal
          isOpen={showTermsModal}
          onClose={() => {
            setShowTermsModal(false);
            setModalType('none');
          }}
          userId={userId}
        />
      )}
    </>
  );
}

