"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  session: any;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ session, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);

  const navItems = [
    { href: "/students", label: "Students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { href: "/classes", label: "Classes", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { href: "/calendar", label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/billing", label: "Billing", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-14 bottom-0 w-8 bg-white border-r border-gray-200 z-40 hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Show sidebar"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 shadow-sm transition-transform duration-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <div className="flex flex-col h-full">
        {/* Hide Sidebar Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full"
            aria-label="Hide sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Hide sidebar</span>
          </button>
        </div>

        {/* Top Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-1">
            <a
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My work
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recents
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              More
            </a>
          </nav>
        </div>

        {/* Favorites Section */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setFavoritesExpanded(!favoritesExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>Favorites</span>
            <svg
              className={`h-4 w-4 transition-transform ${favoritesExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {favoritesExpanded && (
            <div className="mt-2 space-y-1">
              {/* Favorites items would go here */}
              <p className="text-xs text-gray-500 px-3 py-2">No favorites yet</p>
            </div>
          )}
        </div>

        {/* Workspaces Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                M
              </div>
              <select className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer">
                <option>Main workspace</option>
              </select>
            </div>
            <button className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs hover:bg-blue-600 transition-colors">
              +
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}