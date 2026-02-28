"use client";

import { useState } from "react";

const INPUT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";
const SELECT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm bg-white focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";

interface RelationshipFieldProps {
  defaultValue: string;
  otherValue?: string;
  onRelationshipChange?: (relationship: string) => void;
  /** When set, form field names use parentRelationship_${parentIndex} and parentRelationshipOther_${parentIndex} */
  parentIndex?: number;
}

export default function RelationshipField({ defaultValue, otherValue, onRelationshipChange, parentIndex }: RelationshipFieldProps) {
  const [selectedRelationship, setSelectedRelationship] = useState(defaultValue);
  const [otherText, setOtherText] = useState(otherValue || "");

  const handleRelationshipChange = (value: string) => {
    setSelectedRelationship(value);
    onRelationshipChange?.(value);
  };

  const relationshipName = parentIndex !== undefined ? `parentRelationship_${parentIndex}` : "parentRelationship";
  const relationshipOtherName = parentIndex !== undefined ? `parentRelationshipOther_${parentIndex}` : "parentRelationshipOther";

  return (
    <div className={selectedRelationship === "Other" ? "grid grid-cols-2 gap-4" : ""}>
      <select
        name={relationshipName}
        value={selectedRelationship}
        onChange={(e) => handleRelationshipChange(e.target.value)}
        className={SELECT}
      >
        <option value="">Select relationship</option>
        <option value="Mother">Mother</option>
        <option value="Father">Father</option>
        <option value="Other">Other</option>
        <option value="N/A">N/A</option>
      </select>

      {selectedRelationship === "Other" && (
        <input
          name={relationshipOtherName}
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          placeholder="e.g. Grandmother, Guardian…"
          className={INPUT}
        />
      )}
    </div>
  );
}
