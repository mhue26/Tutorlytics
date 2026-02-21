"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getSubjectColor } from './subjectColors';

interface SubjectsMultiSelectProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  /** Controlled mode: comma-separated value */
  value?: string;
  /** Controlled mode: called with comma-separated value when selection changes */
  onChange?: (value: string) => void;
  /** Called when dropdown closes (e.g. for inline table save) */
  onClose?: () => void;
  /** Called on Escape (e.g. cancel inline edit without saving) */
  onCancel?: () => void;
  /** Compact styling for table cells */
  compact?: boolean;
  /** Open dropdown immediately on mount (e.g. when used in table cell) */
  defaultOpen?: boolean;
}

// Get available subjects from localStorage (user-created only)
const getAvailableSubjects = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('availableSubjects');
  return stored ? JSON.parse(stored) : [];
};

const saveAvailableSubjects = (subjects: string[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('availableSubjects', JSON.stringify(subjects));
};

const parseSubjects = (s: string) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);

export default function SubjectsMultiSelect({
  name,
  defaultValue = "",
  required = false,
  value: controlledValue,
  onChange: controlledOnChange,
  onClose,
  onCancel,
  compact = false,
  defaultOpen = false,
}: SubjectsMultiSelectProps) {
  const isControlled = controlledValue !== undefined && controlledOnChange !== undefined;
  const selectedFromProp = isControlled ? parseSubjects(controlledValue) : null;

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    isControlled ? selectedFromProp! : (defaultValue ? parseSubjects(defaultValue) : [])
  );
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = isControlled ? selectedFromProp! : selectedSubjects;
  const setSelected = (next: string[] | ((prev: string[]) => string[])) => {
    const nextList = typeof next === "function" ? next(selected) : next;
    if (isControlled) controlledOnChange!(nextList.join(","));
    else setSelectedSubjects(nextList);
  };

  // Initialize client-side rendering and merge available with current value's subjects
  useEffect(() => {
    setIsClient(true);
    const fromStorage = getAvailableSubjects();
    const fromValue = isControlled ? parseSubjects(controlledValue ?? "") : parseSubjects(defaultValue);
    const merged = Array.from(new Set([...fromStorage, ...fromValue]));
    setAvailableSubjects(merged);
    if (merged.length > fromStorage.length) saveAvailableSubjects(merged);
  }, []);

  // When defaultOpen (e.g. table cell): open dropdown and focus input on mount
  useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [defaultOpen]);

  // Position dropdown (for portal) when open; update on scroll/resize
  useEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null);
      return;
    }
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 200),
        });
      }
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Listen for color changes (force re-render)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customSubjectColors') {
        setSelectedSubjects(prev => [...prev]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selected.includes(subject)
  );

  const toggleSubject = (subject: string) => {
    setSelected(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const deleteAvailableSubject = (subject: string) => {
    const updatedSubjects = availableSubjects.filter(s => s !== subject);
    setAvailableSubjects(updatedSubjects);
    saveAvailableSubjects(updatedSubjects);
  };

  const removeSubject = (subject: string) => {
    setSelected(prev => prev.filter(s => s !== subject));
  };

  const addCustomSubject = () => {
    const trimmedSubject = searchTerm.trim();
    if (trimmedSubject && !selected.includes(trimmedSubject)) {
      setSelected(prev => [...prev, trimmedSubject]);
      if (!availableSubjects.includes(trimmedSubject)) {
        const updatedAvailable = [...availableSubjects, trimmedSubject];
        setAvailableSubjects(updatedAvailable);
        saveAvailableSubjects(updatedAvailable);
      }
      setSearchTerm("");
    }
  };

  // Close dropdown when clicking outside (trigger or portaled dropdown); call onClose when closing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
        onClose?.();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const dropdownContent = isOpen && dropdownPosition && typeof document !== "undefined" && (
    <div
      ref={dropdownRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[200px] z-[200]"
      style={{
        position: "fixed",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {searchTerm.trim() && !availableSubjects.includes(searchTerm.trim()) && (
        <div className="p-2 border-b border-gray-100">
          <button
            type="button"
            onClick={addCustomSubject}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Add &quot;{searchTerm.trim()}&quot;
          </button>
        </div>
      )}
      <div className="py-1 overflow-y-auto max-h-52">
        {filteredSubjects.map((subject) => (
          <div
            key={subject}
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-50 group cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSubject(subject);
            }}
          >
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-1 min-w-0 truncate ${isClient ? getSubjectColor(subject) : "bg-gray-200 text-gray-800"}`}
            >
              {subject}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteAvailableSubject(subject);
              }}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity shrink-0"
              title="Remove from available list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {filteredSubjects.length === 0 && searchTerm.trim() && (
          <div className="px-3 py-2 text-sm text-gray-500">
            No options. Type and click &quot;Add&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full" ref={triggerRef}>
      {name != null && (
        <input
          type="hidden"
          name={name}
          value={selected.join(",")}
          required={required}
        />
      )}

      <div
        className={`border border-gray-300 rounded-md flex flex-wrap gap-1 items-center bg-white ${compact ? "min-h-[32px] p-1.5" : "min-h-[42px] p-2"}`}
      >
        {selected.map((subject, index) => (
          <span
            key={`${subject}-${index}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isClient ? getSubjectColor(subject) : "bg-gray-200 text-gray-800"}`}
          >
            {subject}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSubject(subject);
              }}
              className="ml-1 hover:opacity-70 rounded-full focus:outline-none"
              aria-label={`Remove ${subject}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchTerm.trim()) {
              e.preventDefault();
              addCustomSubject();
            }
            if (e.key === "Escape") {
              setIsOpen(false);
              (onCancel ?? onClose)?.();
            }
          }}
          placeholder={selected.length === 0 ? "Select an option or create one" : ""}
          className={`flex-1 min-w-[100px] outline-none ${compact ? "text-sm py-0.5" : "text-sm"}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-gray-600 p-0.5 focus:outline-none"
          aria-label={isOpen ? "Close" : "Open"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  );
}
