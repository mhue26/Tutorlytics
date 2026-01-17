"use client";

import { useState } from "react";
import BoardControls from "./BoardControls";
import BoardGroup from "./BoardGroup";

interface Task {
  id: string;
  title: string;
  assignees?: string[];
  status: "Not Started" | "Working on it" | "Completed";
  dueDate?: Date | string;
  priority?: "Low" | "Medium" | "High";
}

interface Group {
  id: string;
  title: string;
  tasks: Task[];
}

interface BoardViewProps {
  boardTitle: string;
  groups: Group[];
}

export default function BoardView({ boardTitle, groups }: BoardViewProps) {
  const [activeView, setActiveView] = useState("Main table");

  return (
    <div className="space-y-4" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Board Title and View Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{boardTitle}</h1>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("Main table")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === "Main table"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Main table
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Board Controls */}
      <BoardControls />

      {/* Board Groups */}
      <div>
        {groups.map((group) => (
          <BoardGroup key={group.id} title={group.title} tasks={group.tasks} />
        ))}
      </div>

      {/* Add New Group Button */}
      <div className="mt-6">
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add new group
        </button>
      </div>
    </div>
  );
}
