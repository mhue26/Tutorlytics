'use client';

import { useState } from 'react';

interface EditableGoalsProps {
  studentId: number;
  initialNotes: string | null;
}

export default function EditableGoals({ studentId, initialNotes }: EditableGoalsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNotes(initialNotes || '');
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      
      const response = await fetch(`/api/students/${studentId}/goals`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        console.error('Failed to save goals');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    if (notes !== (initialNotes || '')) {
      handleSave();
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 h-full">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-900 mb-1">Student Goals</h3>
          <div className="text-sm text-green-800">
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="w-full bg-transparent border-none outline-none resize-none text-green-800 placeholder-green-600"
                placeholder="Click to add goals"
                autoFocus
                rows={3}
                disabled={isSaving}
              />
            ) : (
              <div 
                onClick={handleClick}
                className="cursor-pointer hover:bg-green-100 rounded p-2 -m-2 transition-colors"
              >
                {notes ? (
                  <div className="whitespace-pre-wrap">
                    {notes.split('\n').map((line, index) => {
                      if (line.trim().startsWith('- ')) {
                        return (
                          <div key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span>{line.trim().substring(2)}</span>
                          </div>
                        );
                      }
                      return <div key={index}>{line}</div>;
                    })}
                  </div>
                ) : (
                  <div className="text-green-600 italic">Click to add goals</div>
                )}
              </div>
            )}
            {isSaving && (
              <div className="text-xs text-green-500 mt-1">Saving...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
