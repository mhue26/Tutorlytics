"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CalendarNavigationProps {
  view: "month" | "week" | "fiveday" | "threeday" | "day";
  currentDate: Date;
  onViewChange: (view: "month" | "week" | "fiveday" | "threeday" | "day") => void;
  onDateChange: (date: Date) => void;
  userId?: string;
}

const getStepDays = (view: CalendarNavigationProps["view"]) => {
  switch (view) {
    case "day":
      return 1;
    case "threeday":
      return 3;
    case "fiveday":
      return 5;
    case "week":
      return 7;
    default:
      return 0;
  }
};

export default function CalendarNavigation({ view, currentDate, onViewChange, onDateChange, userId }: CalendarNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = (next: { date?: Date; view?: CalendarNavigationProps["view"] }) => {
    const params = new URLSearchParams(searchParams);
    const date = next.date ?? currentDate;
    const nextView = next.view ?? view;
    params.set("month", (date.getMonth() + 1).toString());
    params.set("year", date.getFullYear().toString());
    params.set("view", nextView);
    router.replace(`/calendar?${params.toString()}`, { scroll: false });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else {
      const step = getStepDays(view);
      const delta = direction === "prev" ? -step : step;
      newDate.setDate(newDate.getDate() + delta);
    }

    onDateChange(newDate);
    updateUrl({ date: newDate });
  };


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-gray-900">
            {view === "month"
              ? currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
              : currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
              title="Previous"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors border-l border-gray-200"
              title="Next"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              onDateChange(today);
              updateUrl({ date: today });
            }}
            className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Today
          </button>

          <div className="relative">
            <select
              value={view}
              onChange={(e) => {
                const nextView = e.target.value as CalendarNavigationProps["view"];
                onViewChange(nextView);
                updateUrl({ view: nextView });
              }}
              className="h-10 rounded-full border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Calendar view"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="threeday">3 days</option>
              <option value="fiveday">5 days</option>
              <option value="month">Month</option>
            </select>
          </div>

          <Link
            href="/schedule"
            title="Schedule"
            aria-label="Go to schedule"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
