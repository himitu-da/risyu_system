// app/components/SemesterSelector.tsx
import React from 'react';
import { semesters } from '../utils/storage';

interface SemesterSelectorProps {
  currentSemester: string;
  onChange: (semester: string) => void;
}

const SemesterSelector: React.FC<SemesterSelectorProps> = ({ currentSemester, onChange }) => {
  return (
    <div className="mb-2">
      <label htmlFor="semester-select" className="block text-sm font-medium mb-2">
        学期
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {semesters.map((semester) => (
          <button
            key={semester}
            onClick={() => onChange(semester)}
            className={`py-2 px-4 rounded-lg text-center transition-all border ${
              currentSemester === semester
                ? 'bg-[--primary-light] text-[--primary-dark] font-medium border-[--primary] shadow-sm'
                : 'bg-[--secondary] text-[--foreground] hover:bg-[--secondary-hover] border-[--border]'
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