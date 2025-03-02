// app/components/CreditSummary.tsx
import React from 'react';
import { semesters, SemesterTimetable, calculateCredits } from '../utils/storage';

interface CreditSummaryProps {
  timetable: SemesterTimetable;
  totalCredits: number;
}

const CreditSummary: React.FC<CreditSummaryProps> = ({ timetable, totalCredits }) => {
  return (
    <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">全体の単位数</h2>
      <p className="text-xl text-gray-800">総単位数: {totalCredits}単位</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {semesters.map((semester) => (
          <div key={semester} className="bg-white p-2 rounded border border-gray-200">
            <div className="font-semibold text-gray-700">{semester}</div>
            <div className="text-gray-600">{calculateCredits(timetable, semester)}単位</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditSummary;