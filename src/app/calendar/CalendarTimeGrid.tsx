"use client";

import React, { useMemo } from "react";
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

type TimeGridView = "week" | "fiveday" | "threeday" | "day";

interface CalendarTimeGridProps {
  meetings: Meeting[];
  currentDate: Date;
  view: TimeGridView;
  calendarEvents?: CalendarEventDTO[];
}

const VISIBLE_START_HOUR = 8;
const VISIBLE_END_HOUR = 21; // inclusive
const HOUR_SLOT_HEIGHT_PX = 60;

function getVisibleDays(currentDate: Date, view: TimeGridView): Date[] {
  const base = new Date(currentDate);
  base.setHours(0, 0, 0, 0);

  if (view === "day") {
    return [base];
  }

  if (view === "week") {
    const start = new Date(base);
    const day = start.getDay(); // 0 = Sun
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  if (view === "fiveday") {
    const start = new Date(base);
    const day = start.getDay(); // 0 = Sun
    const diffToMonday = (day + 6) % 7; // 0->6,1->0,...,6->5
    start.setDate(start.getDate() - diffToMonday);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  // "threeday"
  const start = new Date(base);
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarTimeGrid({ meetings, currentDate, view, calendarEvents = [] }: CalendarTimeGridProps) {
  const days = useMemo(() => getVisibleDays(currentDate, view), [currentDate, view]);

  const hours = useMemo(
    () =>
      Array.from(
        { length: VISIBLE_END_HOUR - VISIBLE_START_HOUR + 1 },
        (_, i) => VISIBLE_START_HOUR + i
      ),
    []
  );

  const dayMeetings = useMemo(
    () =>
      days.map((day) => {
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const meetingsForDay = meetings.filter((meeting) => {
          const start = new Date(meeting.startTime);
          return start >= startOfDay && start < endOfDay;
        });

        meetingsForDay.sort(
          (a, b) =>
            new Date(a.startTime).getTime() -
            new Date(b.startTime).getTime()
        );

        const checkInsForDay = calendarEvents
          .filter((event) => event.type === "CHECK_IN")
          .filter((event) => {
            const start = new Date(event.start);
            return start >= startOfDay && start < endOfDay;
          })
          .sort(
            (a, b) =>
              new Date(a.start).getTime() - new Date(b.start).getTime()
          );

        const keyDatesForDay = calendarEvents
          .filter((event) => event.type === "KEY_DATE")
          .filter((event) => {
            const start = new Date(event.start);
            return isSameDay(start, day);
          });

        return { day, meetings: meetingsForDay, checkIns: checkInsForDay, keyDates: keyDatesForDay };
      }),
    [days, meetings, calendarEvents]
  );

  const minutesPerPixel = 60 / HOUR_SLOT_HEIGHT_PX;
  const totalMinutes = (VISIBLE_END_HOUR - VISIBLE_START_HOUR) * 60;
  const timelineHeight = totalMinutes / minutesPerPixel;

  const formatDayHeader = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const formatTimeLabel = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  };

  const today = new Date();

  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[64px_minmax(0,1fr)]">
        <div className="bg-gray-50 border-b border-gray-200" />
        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`px-3 py-2 border-b border-gray-200 text-sm font-medium ${
                  isToday ? "text-blue-700 bg-blue-50" : "text-gray-700 bg-gray-50"
                }`}
              >
                {formatDayHeader(day)}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[64px_minmax(0,1fr)]">
        <div className="relative border-r border-gray-200">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b border-gray-100 text-xs text-gray-400 pr-2 flex justify-end items-start pt-1"
            >
              {formatTimeLabel(hour)}
            </div>
          ))}
        </div>

        <div className="relative overflow-x-auto">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            {dayMeetings.map(({ day, meetings: dayEvents, checkIns, keyDates }) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-l border-gray-100`}
                  style={{ height: timelineHeight }}
                >
                  {/* All-day key dates row at top */}
                  {keyDates.length > 0 && (
                    <div className="absolute inset-x-1 top-1 flex flex-col gap-1 z-20">
                      {keyDates.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium truncate shadow-sm"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`absolute left-0 right-0 border-b border-dashed border-gray-100`}
                      style={{
                        top: (hour - VISIBLE_START_HOUR) * HOUR_SLOT_HEIGHT_PX,
                      }}
                    />
                  ))}

                  {dayEvents.map((meeting) => {
                    const start = new Date(meeting.startTime);
                    const end = new Date(meeting.endTime);

                    const startMinutes =
                      start.getHours() * 60 + start.getMinutes();
                    const endMinutes =
                      end.getHours() * 60 + end.getMinutes();

                    const visibleStartMinutes =
                      VISIBLE_START_HOUR * 60;
                    const visibleEndMinutes =
                      (VISIBLE_END_HOUR + 1) * 60;

                    const clampedStart = Math.max(
                      startMinutes,
                      visibleStartMinutes
                    );
                    const clampedEnd = Math.max(
                      clampedStart + 15,
                      Math.min(endMinutes, visibleEndMinutes)
                    );

                    const topPx =
                      ((clampedStart - visibleStartMinutes) /
                        minutesPerPixel) /
                      60 *
                      HOUR_SLOT_HEIGHT_PX;
                    const heightPx =
                      ((clampedEnd - clampedStart) /
                        minutesPerPixel) /
                      60 *
                      HOUR_SLOT_HEIGHT_PX;

                    return (
                      <div
                        key={meeting.id}
                        className={`absolute inset-x-1 rounded-md px-2 py-1 text-xs shadow-sm ${
                          meeting.isCompleted
                            ? "bg-green-100 text-green-900 border border-green-200"
                            : "bg-blue-100 text-blue-900 border border-blue-200"
                        } ${isToday ? "ring-1 ring-blue-200" : ""}`}
                        style={{
                          top: topPx,
                          height: heightPx,
                        }}
                        title={`${meeting.title} with ${meeting.student.firstName} ${meeting.student.lastName}`}
                      >
                        <div className="font-semibold truncate">
                          {meeting.title}
                        </div>
                        <div className="truncate">
                          {meeting.student.firstName}{" "}
                          {meeting.student.lastName}
                        </div>
                      </div>
                    );
                  })}

                  {checkIns.map((event) => {
                    const start = new Date(event.start);
                    const startMinutes =
                      start.getHours() * 60 + start.getMinutes();
                    const visibleStartMinutes = VISIBLE_START_HOUR * 60;
                    const visibleEndMinutes = (VISIBLE_END_HOUR + 1) * 60;

                    const clampedStart = Math.max(
                      startMinutes,
                      visibleStartMinutes
                    );
                    const clampedEnd = Math.min(
                      clampedStart + 30,
                      visibleEndMinutes
                    );

                    const topPx =
                      ((clampedStart - visibleStartMinutes) /
                        minutesPerPixel) /
                      60 *
                      HOUR_SLOT_HEIGHT_PX;
                    const heightPx =
                      ((clampedEnd - clampedStart) /
                        minutesPerPixel) /
                      60 *
                      HOUR_SLOT_HEIGHT_PX;

                    return (
                      <div
                        key={event.id}
                        className={`absolute inset-x-6 rounded-md px-2 py-1 text-[11px] shadow-sm bg-emerald-100 text-emerald-900 border border-emerald-200 ${
                          isToday ? "ring-1 ring-emerald-200" : ""
                        }`}
                        style={{
                          top: topPx,
                          height: heightPx,
                        }}
                        title={event.title}
                      >
                        <div className="truncate">{event.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

