"use client";

import { useState } from "react";

interface Term {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  year: number;
}

interface RepeatOptionsBlockProps {
  terms: Term[];
}

type RepeatPreset = "" | "daily" | "weekly" | "biweekly" | "monthly" | "custom";

export default function RepeatOptionsBlock({ terms }: RepeatOptionsBlockProps) {
  const [repeatPreset, setRepeatPreset] = useState<RepeatPreset>("");
  const [customType, setCustomType] = useState<"daily" | "weekly" | "biweekly" | "monthly">("weekly");
  const [endCondition, setEndCondition] = useState<"count" | "term">("count");

  const isRepeating = repeatPreset !== "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Repeat:</span>
        <select
          value={repeatPreset}
          onChange={(e) => setRepeatPreset(e.target.value as RepeatPreset)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
        >
          <option value="">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Fortnightly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {isRepeating && (
        <>
          {repeatPreset === "custom" && (
            <div className="flex items-center gap-2 pl-0">
              <span className="text-sm text-gray-600">Repeat type:</span>
              <select
                name="repeatType"
                value={customType}
                onChange={(e) => setCustomType(e.target.value as typeof customType)}
                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Fortnightly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
          {repeatPreset !== "custom" && (
            <input type="hidden" name="repeatType" value={repeatPreset} readOnly />
          )}
          <input type="hidden" name="isRepeating" value="on" readOnly />

          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">End</span>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="repeatEndCondition"
                  value="count"
                  checked={endCondition === "count"}
                  onChange={() => setEndCondition("count")}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">After</span>
                <input
                  type="number"
                  name="repeatCount"
                  min={2}
                  max={52}
                  defaultValue={4}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-sm text-gray-700">occurrences</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="repeatEndCondition"
                  value="term"
                  checked={endCondition === "term"}
                  onChange={() => setEndCondition("term")}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">At end of term</span>
                <select
                  name="repeatTermId"
                  className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={endCondition !== "term"}
                  required={endCondition === "term"}
                >
                  <option value="">Select term</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} {term.year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
