"use client";

import { useEffect, useState } from 'react';
import { getDefaultSubjectColor, getSubjectColor } from './subjectColors';
import SubjectColorPicker from './SubjectColorPicker';

interface SubjectsDisplayProps {
  subjects: string;
  allowColorPicker?: boolean;
}

export default function SubjectsDisplay({ subjects, allowColorPicker = false }: SubjectsDisplayProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const subjectList = (subjects || "").split(",").map(s => s.trim()).filter(s => s);

  const [subjectClasses, setSubjectClasses] = useState<string[]>(
    () => subjectList.map((s) => getDefaultSubjectColor(s))
  );

  useEffect(() => {
    setSubjectClasses(subjectList.map((s) => getSubjectColor(s)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, refreshKey]);

  if (!subjects || subjects.trim() === "") {
    return <span className="text-gray-500">—</span>;
  }

  const handleColorChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {subjectList.map((subject, index) => (
        <span
          key={`${subject}-${index}-${refreshKey}`}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subjectClasses[index] || getDefaultSubjectColor(subject)}`}
        >
          {subject}
          {allowColorPicker && (
            <SubjectColorPicker 
              subject={subject} 
              onColorChange={handleColorChange}
            />
          )}
        </span>
      ))}
    </div>
  );
}
