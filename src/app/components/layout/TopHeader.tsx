"use client";

import { useState, useEffect } from "react";
import ProfileDropdown from "../../ProfileDropdown";
import ProfileEditModal from "../../profile/ProfileEditModal";

interface TopHeaderProps {
  session: any;
}

export default function TopHeader({ session }: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopHeader.tsx:18',message:'TopHeader mounted',data:{hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    setMounted(true);
  }, [session]);
  // #endregion

  // #region agent log
  if (!mounted) {
    fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopHeader.tsx:25',message:'TopHeader not mounted yet',data:{mounted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }
  // #endregion

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shadow-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Left side - Logo */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-semibold text-[#584b53] hover:text-[#E4BB97] transition-colors">
            Tutorlytics
          </a>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Icons and profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors relative"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Help */}
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Help"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Profile */}
          {session ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <a href="/signin" className="bg-[#3D4756] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#2A3441] transition-colors">
              Log in
            </a>
          )}
        </div>
      </header>
      {session?.user ? <ProfileEditModal user={session.user} /> : null}
    </>
  );
}
