"use client";

import Link from "next/link";
import ProfileDropdown from "../../ProfileDropdown";

interface TopHeaderProps {
  session: any;
}

export default function TopHeader({ session }: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shadow-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex items-center gap-4">
          <Link href={session ? "/dashboard" : "/"} className="text-lg font-semibold text-[#584b53] hover:text-[#E4BB97] transition-colors">
            Tutorlytics
          </Link>
        </div>

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

        <div className="flex items-center gap-2">
          {session ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <a href="/signin" className="bg-[#3D4756] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#2A3441] transition-colors">
              Log in
            </a>
          )}
        </div>
      </header>
  );
}
