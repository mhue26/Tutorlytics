"use client";

import { useState } from "react";
import RelationshipField from "./RelationshipField";

const INPUT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";
const LABEL = "block text-sm font-medium text-gray-700";
const SELECT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm bg-white focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";

export interface ParentEntry {
  relationship: string;
  relationshipOther: string;
  name: string;
  preferredContact: { method: string; details: string };
  alternativeContacts: { method: string; details: string }[];
}

interface ParentInformationClientProps {
  initialParents: ParentEntry[];
}

export default function ParentInformationClient({ initialParents }: ParentInformationClientProps) {
  const [parents, setParents] = useState<ParentEntry[]>(
    initialParents.length > 0 ? initialParents : [{ relationship: "", relationshipOther: "", name: "", preferredContact: { method: "", details: "" }, alternativeContacts: [] }]
  );

  const addParent = () => {
    setParents([
      ...parents,
      { relationship: "", relationshipOther: "", name: "", preferredContact: { method: "", details: "" }, alternativeContacts: [] },
    ]);
  };

  const removeParent = (index: number) => {
    if (parents.length <= 1) return;
    setParents(parents.filter((_, i) => i !== index));
  };

  const setRelationship = (index: number, value: string) => {
    setParents(parents.map((p, i) => (i === index ? { ...p, relationship: value } : p)));
  };

  const setRelationshipOther = (index: number, value: string) => {
    setParents(parents.map((p, i) => (i === index ? { ...p, relationshipOther: value } : p)));
  };

  const addAlternativeContact = (parentIndex: number) => {
    setParents(
      parents.map((p, i) =>
        i === parentIndex ? { ...p, alternativeContacts: [...p.alternativeContacts, { method: "", details: "" }] } : p
      )
    );
  };

  const removeAlternativeContact = (parentIndex: number, contactIndex: number) => {
    setParents(
      parents.map((p, i) =>
        i === parentIndex ? { ...p, alternativeContacts: p.alternativeContacts.filter((_, j) => j !== contactIndex) } : p
      )
    );
  };

  const updateAlternativeContact = (parentIndex: number, contactIndex: number, field: "method" | "details", value: string) => {
    setParents(
      parents.map((p, i) =>
        i === parentIndex
          ? {
              ...p,
              alternativeContacts: p.alternativeContacts.map((c, j) =>
                j === contactIndex ? { ...c, [field]: value } : c
              ),
            }
          : p
      )
    );
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">Parent information</h2>

      {parents.map((parent, parentIndex) => (
        <div
          key={parentIndex}
          className="border-t border-gray-200 mt-6 pt-6 space-y-6"
        >
          {parents.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Parent {parentIndex + 1}</span>
              <button
                type="button"
                onClick={() => removeParent(parentIndex)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove parent
              </button>
            </div>
          )}

          {/* Relationship */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
            <p className={LABEL}>Relationship</p>
            <RelationshipField
              defaultValue={parent.relationship}
              otherValue={parent.relationshipOther}
              onRelationshipChange={(value) => setRelationship(parentIndex, value)}
              parentIndex={parentIndex}
            />
          </div>

          {parent.relationship !== "N/A" && (
            <>
              {/* Parent name */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
                <p className={LABEL}>Name</p>
                <input
                  name={`parentName_${parentIndex}`}
                  defaultValue={parent.name}
                  placeholder="First Last"
                  className={INPUT}
                />
              </div>

              {/* Preferred contact */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
                <p className={LABEL}>Preferred contact</p>
                <div className="flex gap-2">
                  <select
                    name={`parentContactMethod_${parentIndex}`}
                    defaultValue={parent.preferredContact.method}
                    className={`${SELECT} mt-0 flex-1`}
                  >
                    <option value="">Select method</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WeChat">WeChat</option>
                  </select>
                  <input
                    name={`parentContactDetails_${parentIndex}`}
                    defaultValue={parent.preferredContact.details}
                    placeholder="Enter contact details"
                    className={`${INPUT} mt-0 flex-1`}
                  />
                </div>
              </div>

              {/* Alternative contacts */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
                <p className={LABEL}>Alternative contact</p>
                <div className="space-y-3">
                  {parent.alternativeContacts.map((contact, contactIndex) => (
                    <div key={contactIndex} className="flex gap-2 items-center">
                      <select
                        name={`alternativeContactMethod-${parentIndex}-${contactIndex}`}
                        value={contact.method}
                        onChange={(e) => updateAlternativeContact(parentIndex, contactIndex, "method", e.target.value)}
                        className={`${SELECT} mt-0 flex-1`}
                      >
                        <option value="">Select method</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="WeChat">WeChat</option>
                      </select>
                      <input
                        name={`alternativeContactDetails-${parentIndex}-${contactIndex}`}
                        value={contact.details}
                        onChange={(e) => updateAlternativeContact(parentIndex, contactIndex, "details", e.target.value)}
                        placeholder="Enter contact details"
                        className={`${INPUT} mt-0 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAlternativeContact(parentIndex, contactIndex)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 self-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addAlternativeContact(parentIndex)}
                    className="mt-1 text-sm font-medium text-[#3D4756] hover:text-[#2A3441] transition-colors"
                  >
                    + Add another contact
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={addParent}
          className="text-sm font-medium text-[#3D4756] hover:text-[#2A3441] transition-colors"
        >
          + Add another parent
        </button>
      </div>

      <input type="hidden" name="parentCount" value={parents.length} />
    </div>
  );
}
