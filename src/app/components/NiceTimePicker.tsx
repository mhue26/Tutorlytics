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
  if (!value) return "-- : --";
  const [h, m] = value.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return "-- : --";

  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Parse user-typed time string to HH:MM (24h) or null if invalid. */
function parseTimeString(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try "HH:MM" or "H:MM" (24h)
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})\s*$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // Try "H:MM am/pm" or "HH:MM am/pm"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const ampm = match12[3].toLowerCase();
    if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
      if (ampm === "pm" && h !== 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // Try "H am/pm" or "HH am/pm" (whole hour)
  const matchHour = trimmed.match(/^(\d{1,2})\s*(am|pm)$/i);
  if (matchHour) {
    let h = parseInt(matchHour[1], 10);
    const ampm = matchHour[2].toLowerCase();
    if (h >= 1 && h <= 12) {
      if (ampm === "pm" && h !== 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // Try bare hour 0-23
  const bareHour = parseInt(trimmed, 10);
  if (!Number.isNaN(bareHour) && bareHour >= 0 && bareHour <= 23) {
    return `${bareHour.toString().padStart(2, "0")}:00`;
  }

  return null;
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

  const [inputText, setInputText] = useState<string>(() =>
    selectedValue ? formatDisplayTime(selectedValue) : ""
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInputText(selectedValue ? formatDisplayTime(selectedValue) : "");
  }, [selectedValue]);

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

  const setValue = (next: string) => {
    if (isControlled) {
      onChange?.(next);
    } else {
      setInternalValue(next);
    }
    setInputText(next ? formatDisplayTime(next) : "");
  };

  const handleBlur = () => {
    const parsed = parseTimeString(inputText);
    if (parsed !== null) {
      setValue(parsed);
    } else {
      setInputText(selectedValue ? formatDisplayTime(selectedValue) : "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-sm w-[7.5rem]">
      <input type="hidden" name={name} value={selectedValue} />

      <div className="inline-flex w-full items-center gap-1.5 px-2.5 py-2 rounded-xl border border-gray-300 bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="-- : --"
          className="flex-1 min-w-0 w-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-center"
          aria-label="Time"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
          aria-label="Open time list"
        >
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
        </button>
      </div>

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
                    setValue(time);
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

