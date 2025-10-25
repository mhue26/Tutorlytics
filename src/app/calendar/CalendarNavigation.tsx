"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TeachingPeriodsModal from "./TermsHolidaysModal";
import { useModal } from "../contexts/ModalContext";

interface CalendarNavigationProps {
  onScheduleClick?: () => void;
  userId?: string;
}

export default function CalendarNavigation({ onScheduleClick, userId }: CalendarNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setModalType } = useModal();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    if (month && year) {
      return new Date(parseInt(year), parseInt(month) - 1);
    }
    return new Date();
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    
    // Update URL with new month/year without scrolling
    const params = new URLSearchParams(searchParams);
    params.set('month', (newDate.getMonth() + 1).toString());
    params.set('year', newDate.getFullYear().toString());
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
          
          <button
            onClick={() => {
              setShowTermsModal(true);
              setModalType('teachingPeriods');
            }}
            className="text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors cursor-pointer"
            title="Customise"
          >
            {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </button>
          
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

        <div className="flex-1 flex justify-end">
          {onScheduleClick && (
            <button
              onClick={onScheduleClick}
              className="rounded-lg bg-[#3D4756] text-white px-6 py-3 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
            >
              Schedule
            </button>
          )}
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
