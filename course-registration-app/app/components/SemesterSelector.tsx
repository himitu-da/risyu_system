// app/components/SemesterSelector.tsx
import React from 'react';
import { semesters } from '../utils/storage';

interface SemesterSelectorProps {
  currentSemester: string;
  onChange: (semester: string) => void;
}

const SemesterSelector: React.FC<SemesterSelectorProps> = ({ currentSemester, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold text-gray-800">学期選択:</label>
      <div className="flex flex-wrap gap-2">
        {semesters.map((semester) => (
          <button
            key={semester}
            className={`px-3 py-1 rounded ${
              currentSemester === semester 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
            }`}
            onClick={() => onChange(semester)}
          >
            {semester}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SemesterSelector;