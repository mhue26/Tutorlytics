"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Workspace {
  organisationId: string;
  role: string;
  organisationName: string;
  isPersonal: boolean;
}

interface SidebarProps {
  session: any;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ session, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, update: updateSession } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const currentOrgId = (sessionData?.user ?? session?.user) && (sessionData?.user as any)?.organisationId;

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;
    fetch("/api/me/workspaces")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setWorkspaces(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [session?.user]);

  async function switchWorkspace(organisationId: string, role: string) {
    if (organisationId === currentOrgId) return;
    await updateSession?.({ organisationId, role });
    router.refresh();
  }

  const navItems = [
    { href: "/students", label: "Students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { href: "/classes", label: "Classes", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { href: "/calendar", label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: "/billing", label: "Billing", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-8 h-full bg-white border-r border-gray-200 z-40 hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Show sidebar"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <aside className="w-64 h-full bg-white overflow-y-auto border-r border-gray-200 shadow-sm relative" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Hide sidebar - left-facing arrow on right edge */}
      <button
        onClick={onToggle}
        className="absolute right-0 top-0 bottom-0 w-8 bg-white z-10 hover:bg-gray-50 transition-colors flex items-center justify-center"
        aria-label="Hide sidebar"
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex flex-col h-full">
        {/* Workspaces */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase px-3 mb-2">
            Workspaces
          </p>
          <div className="space-y-0.5">
            {workspaces.map((w) => {
              const isCurrent = w.organisationId === currentOrgId;
              return (
                <button
                  key={w.organisationId}
                  type="button"
                  onClick={() => switchWorkspace(w.organisationId, w.role)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors truncate border-l-2 ${
                    isCurrent
                      ? "bg-blue-50 text-blue-700 border-blue-700"
                      : "border-transparent text-gray-700 hover:bg-gray-50"
                  }`}
                  title={w.organisationName}
                >
                  {w.organisationName}
                </button>
              );
            })}
          </div>
        </div>
        {/* Main Navigation */}
        <div className="flex-1 p-4">
          <div className="mb-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase px-3">
              Navigation
            </p>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}