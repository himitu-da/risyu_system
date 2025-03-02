// app/components/SemesterSelector.tsx
'use client';

import React from 'react';

interface SemesterSelectorProps {
  currentSemester: string;
  onChange: (semester: string) => void;
}

const SemesterSelector: React.FC<SemesterSelectorProps> = ({ currentSemester, onChange }) => {
  const semesters = ['1年春学期', '1年秋学期', '2年春学期', '2年秋学期', '3年春学期', '3年秋学期', '4年春学期', '4年秋学期'];

  return (
    <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">学期選択</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {semesters.map((semester) => (
          <button
            key={semester}
            onClick={() => onChange(semester)}
            className={`p-2 border rounded-md ${
              currentSemester === semester
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {semester}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SemesterSelector;