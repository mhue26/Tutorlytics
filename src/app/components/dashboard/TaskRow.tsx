"use client";

interface TaskRowProps {
  task: {
    id: string;
    title: string;
    assignees?: string[];
    status: "Not Started" | "Working on it" | "Completed";
    dueDate?: Date | string;
    priority?: "Low" | "Medium" | "High";
  };
}

export default function TaskRow({ task }: TaskRowProps) {
  const statusColors = {
    "Not Started": "bg-gray-100 text-gray-800",
    "Working on it": "bg-orange-100 text-orange-800",
    "Completed": "bg-green-100 text-green-800",
  };

  const priorityColors = {
    "Low": "bg-blue-100 text-blue-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-purple-100 text-purple-800",
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow";
    } else {
      return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>
      
      {/* Task */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{task.title}</span>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
      </div>
      
      {/* People */}
      <div className="flex items-center gap-2">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex items-center gap-1">
            {task.assignees.slice(0, 2).map((assignee, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium"
              >
                {assignee.charAt(0).toUpperCase()}
              </div>
            ))}
            {task.assignees.length > 2 && (
              <span className="text-xs text-gray-500">+{task.assignees.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </div>
      
      {/* Status */}
      <div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
      
      {/* Due date */}
      <div className="flex items-center gap-1 text-sm text-gray-600">
        {task.dueDate ? (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(task.dueDate)}
          </>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
      
      {/* Priority */}
      <div>
        {task.priority ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </div>
  );
}
