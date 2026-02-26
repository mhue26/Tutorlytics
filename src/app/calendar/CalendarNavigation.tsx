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

    const params = new URLSearchParams(searchParams);
    params.set('month', (newDate.getMonth() + 1).toString());
    params.set('year', newDate.getFullYear().toString());
    params.set('view', view);
    router.replace(`/calendar?${params.toString()}`, { scroll: false });
  };


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          {/* Left spacer to push the month navigation to the center */}
        </div>
        
        <div className="relative h-10 w-72 flex justify-center items-center">
          <button
            onClick={() => navigateMonth('prev')}
            className="absolute left-0 p-2 text-gray-500 hover:text-gray-900 transition-colors"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-lg font-medium text-gray-900">
            {view === "month"
              ? currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
              : currentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          
          <button
            onClick={() => navigateMonth('next')}
            className="absolute right-0 p-2 text-gray-500 hover:text-gray-900 transition-colors"
            title="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex justify-end items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-sm text-sm overflow-hidden">
            {[
              { id: "month", label: "Month" },
              { id: "week", label: "Week" },
              { id: "fiveday", label: "5 days" },
              { id: "threeday", label: "3 days" },
              { id: "day", label: "Day" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onViewChange(option.id as CalendarNavigationProps["view"]);
                  const params = new URLSearchParams(searchParams);
                  params.set('view', option.id);
                  params.set('month', (currentDate.getMonth() + 1).toString());
                  params.set('year', currentDate.getFullYear().toString());
                  router.replace(`/calendar?${params.toString()}`, { scroll: false });
                }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === option.id
                    ? "bg-[#3D4756] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Link
            href="/schedule"
            className="rounded-lg bg-[#3D4756] text-white px-6 py-3 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
          >
            Schedule
          </Link>
        </div>
      </div>
    </>
  );
}
