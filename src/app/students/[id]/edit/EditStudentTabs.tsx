"use client";

import { useState } from "react";

interface EditStudentTabsProps {
  labels: string[];
  children: React.ReactNode[];
}

export default function EditStudentTabs({ labels, children }: EditStudentTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-1" aria-label="Edit student tabs">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
                activeIndex === i
                  ? "border-b-2 border-[#3D4756] text-[#3D4756]"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Panels — all rendered in DOM so hidden fields still submit */}
      {children.map((child, i) => (
        <div key={i} className={i === activeIndex ? "" : "hidden"}>
          {child}
        </div>
      ))}
    </div>
  );
}
