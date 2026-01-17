"use client";

import { useState } from "react";
import TopHeader from "./TopHeader";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  session: any;
}

export default function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      <TopHeader session={session} />
      <div className="flex flex-1 pt-14">
        <Sidebar session={session} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
