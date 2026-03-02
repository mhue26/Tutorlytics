"use client";

import { Suspense, useState } from "react";
import TopHeader from "./TopHeader";
import Sidebar from "./Sidebar";
import SessionNeedOrgFix from "../SessionNeedOrgFix";
import SwitchWorkspaceFromQuery from "../SwitchWorkspaceFromQuery";
import CalendarUndoListener from "@/app/calendar/CalendarUndoListener";

interface DashboardLayoutProps {
  children: React.ReactNode;
  session: any;
}

export default function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <CalendarUndoListener />
      <SessionNeedOrgFix />
      <Suspense fallback={null}>
        <SwitchWorkspaceFromQuery />
      </Suspense>
      <TopHeader session={session} />
      <div className="flex flex-1 min-h-0 pt-14">
        <Sidebar session={session} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="flex-1 min-w-0 overflow-y-auto bg-gray-50"
        >
          <div key={(session?.user as any)?.organisationId ?? "no-org"} className="p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
