"use client";

import { useState } from "react";
import BoardTable from "./BoardTable";

interface Task {
  id: string;
  title: string;
  assignees?: string[];
  status: "Not Started" | "Working on it" | "Completed";
  dueDate?: Date | string;
  priority?: "Low" | "Medium" | "High";
}

interface BoardGroupProps {
  title: string;
  tasks: Task[];
}

export default function BoardGroup({ title, tasks }: BoardGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate summary stats
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get earliest due date
  const dueDates = tasks
    .map((t) => (t.dueDate ? (typeof t.dueDate === "string" ? new Date(t.dueDate) : t.dueDate) : null))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  const earliestDueDate = dueDates[0];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  // Get priority distribution
  const priorities = tasks.filter((t) => t.priority).map((t) => t.priority!);
  const priorityCounts = {
    Low: priorities.filter((p) => p === "Low").length,
    Medium: priorities.filter((p) => p === "Medium").length,
    High: priorities.filter((p) => p === "High").length,
  };

  return (
    <div className="mb-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
        >
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {title}
        </button>
      </div>

      {/* Group Content */}
      {isExpanded && (
        <>
          <BoardTable tasks={tasks} />
          
          {/* Summary Bar */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex-1 w-32 h-2 bg-gray-200 rounded-full" />
            </div>
            
            {earliestDueDate && (
              <div className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-medium">
                {formatDate(earliestDueDate)}
              </div>
            )}
            
            {(priorityCounts.Low > 0 || priorityCounts.Medium > 0 || priorityCounts.High > 0) && (
              <div className="flex items-center gap-1">
                {priorityCounts.Low > 0 && (
                  <div className="w-3 h-3 rounded bg-blue-500" title={`${priorityCounts.Low} Low priority`} />
                )}
                {priorityCounts.Medium > 0 && (
                  <div className="w-3 h-3 rounded bg-blue-500" title={`${priorityCounts.Medium} Medium priority`} />
                )}
                {priorityCounts.High > 0 && (
                  <div className="w-3 h-3 rounded bg-purple-500" title={`${priorityCounts.High} High priority`} />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
