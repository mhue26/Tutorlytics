"use client";

import React, { useRef } from "react";
import Link from "next/link";
import type { CalendarEventDTO } from "./getCalendarEvents";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
  student: {
    firstName: string;
    lastName: string;
  };
}

interface TeachingPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  year: number;
  isActive: boolean;
  color: string;
  type: 'term' | 'holiday';
}

interface CalendarGridProps {
  meetings: Meeting[];
  currentYear: number;
  currentMonth: number;
  onDateSelect?: (date: Date) => void;
  isFormOpen?: boolean;
  teachingPeriods?: TeachingPeriod[];
  calendarEvents?: CalendarEventDTO[];
}

export default function CalendarGrid({ meetings, currentYear, currentMonth, onDateSelect, isFormOpen, teachingPeriods = [], calendarEvents = [] }: CalendarGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const getDayMeetings = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.getDate() === date.getDate() && 
             meetingDate.getMonth() === date.getMonth() &&
             meetingDate.getFullYear() === date.getFullYear();
    });
  };

  const getDayTeachingPeriods = (date: Date) => {
    return teachingPeriods.filter(period => {
      // Normalize dates to compare only date parts (year, month, day)
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      
      // Create normalized dates for comparison (set to local midnight)
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
    });
  };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getDayKeyDates = (date: Date) => {
    return calendarEvents.filter((event) => {
      if (event.type !== "KEY_DATE") return false;
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const getDayCheckIns = (date: Date) => {
    return calendarEvents.filter((event) => {
      if (event.type !== "CHECK_IN") return false;
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const handleDateClick = (date: Date) => {
    if (isFormOpen && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="relative" ref={gridRef}>
      <div className="grid grid-cols-8 gap-2">
        {/* Week indicator column header */}
        <div className="text-sm font-medium text-gray-500 text-center p-2">
          Week
        </div>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-sm font-medium text-gray-500 text-center p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar rows */}
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: 5 }, (_, weekIndex) => {
          // Calculate the first day of this week
          const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
          const firstDayOfWeek = firstDayOfMonth.getDay();
          const firstDateOfWeek = new Date(currentYear, currentMonth, weekIndex * 7 - firstDayOfWeek + 1);
          
          // Compute week labels for ALL teaching periods that overlap this week row
          const weekStart = new Date(firstDateOfWeek);
          const weekEnd = new Date(firstDateOfWeek);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const rowPeriodInfos = teachingPeriods
            .filter(period => {
              const startDate = new Date(period.startDate);
              const endDate = new Date(period.endDate);
              const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              // overlap if period starts before week ends and ends after week starts
              return normalizedStart <= weekEnd && normalizedEnd >= weekStart;
            })
            .map(period => {
              const startDate = new Date(period.startDate);
              const endDate = new Date(period.endDate);
              const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

              // Calculate total weeks by counting weeks that contain any part of the period
              // Start from the Sunday of the week containing the period start
              const periodStartWeek = new Date(normalizedStart);
              periodStartWeek.setDate(periodStartWeek.getDate() - periodStartWeek.getDay());
              
              // End at the Saturday of the week containing the period end
              const periodEndWeek = new Date(normalizedEnd);
              periodEndWeek.setDate(periodEndWeek.getDate() + (6 - periodEndWeek.getDay()));
              
              // Count the number of weeks between start and end (inclusive)
              const totalTime = periodEndWeek.getTime() - periodStartWeek.getTime();
              const totalWeeks = Math.floor(totalTime / (1000 * 60 * 60 * 24 * 7)) + 1;

              // Calculate which week this calendar week represents in the period
              // Base it on the week end so the last overlapping week shows the final count
              const msPerWeek = 1000 * 60 * 60 * 24 * 7;
              const effectiveEnd = Math.min(weekEnd.getTime(), periodEndWeek.getTime());
              const weeksElapsed = Math.floor((effectiveEnd - periodStartWeek.getTime()) / msPerWeek) + 1;
              const currentWeekNumber = Math.max(1, weeksElapsed);
              // Ensure we don't exceed the total weeks
              const finalWeekNumber = Math.min(currentWeekNumber, totalWeeks);

              return {
                id: period.id,
                name: period.name,
                type: period.type,
                color: period.color,
                currentWeekNumber: finalWeekNumber,
                totalWeeks,
                // Add the period's start date for sorting
                periodStartDate: normalizedStart
              };
            })
            .sort((a, b) => {
              // Sort by period start date, then by type (holidays first if same start date)
              const startDiff = a.periodStartDate.getTime() - b.periodStartDate.getTime();
              if (startDiff === 0) {
                // If same start date, put holidays before terms
                return a.type === 'holiday' ? -1 : 1;
              }
              return startDiff;
            });
          
          
          return (
            <React.Fragment key={weekIndex}>
              {/* Week indicator cell */}
              <div className="min-h-[100px] p-2 rounded-lg border bg-gray-50 border-gray-200 flex items-center justify-center">
                {rowPeriodInfos.length > 0 ? (
                  <div className="space-y-2">
                    {rowPeriodInfos.map(info => (
                      <div key={`${info.type}-${info.id}`} className="text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {`Week ${info.currentWeekNumber}/${info.totalWeeks}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {info.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">-</div>
                )}
              </div>
              
              {/* Days of the week */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(firstDateOfWeek);
                date.setDate(date.getDate() + dayIndex);
                
                const dayMeetings = getDayMeetings(date);
                const dayTeachingPeriods = getDayTeachingPeriods(date);
                const dayKeyDates = getDayKeyDates(date);
                const dayCheckIns = getDayCheckIns(date);
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday = date.toDateString() === new Date().toDateString();
                // Get the primary teaching period color (first one found)
                const primaryPeriod = dayTeachingPeriods[0];
                const backgroundColor = primaryPeriod ? primaryPeriod.color : undefined;
                const backgroundOpacity = primaryPeriod ? '20' : undefined;

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => handleDateClick(date)}
                    className={`date-cell min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all ${
                      isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                    } ${isToday ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : ''} hover:shadow-md hover:scale-105`}
                    style={{
                      backgroundColor: backgroundColor ? `${backgroundColor}${backgroundOpacity}` : undefined,
                      borderColor: backgroundColor ? backgroundColor : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayKeyDates.slice(0, 2).map((event) => (
                        <Link
                          key={event.id}
                          href={`/calendar/event/keydate/${event.id.replace("keydate-", "")}`}
                          className="block text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium truncate hover:bg-amber-200 transition-colors"
                          title={event.title}
                        >
                          {event.title}
                        </Link>
                      ))}
                      {dayKeyDates.length > 2 && (
                        <div className="text-[10px] text-amber-700 font-medium">
                          +{dayKeyDates.length - 2} more events
                        </div>
                      )}

                      {dayCheckIns.slice(0, 2).map((event) => (
                        <Link
                          key={event.id}
                          href={`/calendar/event/checkin/${event.id.replace("checkin-", "")}`}
                          className="block text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 truncate hover:bg-emerald-200 transition-colors"
                          title={event.title}
                        >
                          {event.title}
                        </Link>
                      ))}

                      {dayMeetings.slice(0, 3).map((meeting) => (
                        <Link
                          key={meeting.id}
                          href={`/calendar/event/lesson/${meeting.id}`}
                          className="block text-xs p-1.5 bg-blue-100 text-blue-800 rounded-md truncate hover:bg-blue-200 transition-colors"
                          title={`${meeting.title} with ${meeting.student.firstName} ${meeting.student.lastName}`}
                        >
                          {meeting.title}
                        </Link>
                      ))}
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
