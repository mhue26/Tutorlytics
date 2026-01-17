"use client";

import TaskRow from "./TaskRow";

interface Task {
  id: string;
  title: string;
  assignees?: string[];
  status: "Not Started" | "Working on it" | "Completed";
  dueDate?: Date | string;
  priority?: "Low" | "Medium" | "High";
}

interface BoardTableProps {
  tasks: Task[];
}

export default function BoardTable({ tasks }: BoardTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 items-center py-3 px-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Task</div>
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">People</div>
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</div>
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Due date</div>
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Priority</div>
      </div>
      
      {/* Table Rows */}
      <div>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
      
      {/* Add Task Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      </div>
    </div>
  );
}
