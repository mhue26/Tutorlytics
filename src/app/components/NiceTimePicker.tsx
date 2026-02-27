"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface NiceTimePickerProps {
  name: string;
  /** Optional controlled value in HH:MM (24h). */
  value?: string;
  /** Called when a time is picked. Required when value is controlled; optional otherwise. */
  onChange?: (next: string) => void;
  /** Initial value for uncontrolled mode, in HH:MM (24h). */
  initialValue?: string;
  /** Minutes between options (default 30). */
  stepMinutes?: number;
}

function formatDisplayTime(value: string): string {
  if (!value) return "Select time";
  const [h, m] = value.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return "Select time";

  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function NiceTimePicker({
  name,
  value,
  onChange,
  initialValue,
  stepMinutes = 30,
}: NiceTimePickerProps) {
  const isControlled = value !== undefined && onChange !== undefined;
  const defaultValue = initialValue ?? "";

  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = isControlled ? value ?? "" : internalValue;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const options = useMemo(() => {
    const items: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const hh = `${h}`.padStart(2, "0");
        const mm = `${m}`.padStart(2, "0");
        items.push(`${hh}:${mm}`);
      }
    }
    return items;
  }, [stepMinutes]);

  const formatOption = (time: string) => formatDisplayTime(time);

  return (
    <div ref={containerRef} className="relative inline-block text-sm w-full">
      <input type="hidden" name={name} value={selectedValue} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-full items-center justify-between px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
      >
        <span className={selectedValue ? "text-gray-900" : "text-gray-400"}>
          {formatDisplayTime(selectedValue)}
        </span>
        <span className="ml-2 text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 mt-1 z-40 w-full">
          <div className="max-h-64 overflow-y-auto rounded-xl shadow-lg border border-gray-200 bg-white">
            {options.map((time) => {
              const isSelected = time === selectedValue;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    if (isControlled) {
                      onChange?.(time);
                    } else {
                      setInternalValue(time);
                    }
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    isSelected
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {formatOption(time)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

