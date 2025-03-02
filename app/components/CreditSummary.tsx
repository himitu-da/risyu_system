// app/components/CreditSummary.tsx
'use client';

import React from 'react';

interface Course {
  name: string;
  credits: number;
}

interface DaySchedule {
  [period: number]: Course | null;
}

interface SemesterData {
  [day: string]: DaySchedule;
}

interface CreditSummaryProps {
  timetable: {
    [semester: string]: SemesterData;
  };
  totalCredits: {
    [semester: string]: number;
  };
}

const CreditSummary: React.FC<CreditSummaryProps> = ({ timetable, totalCredits }) => {
  // 全学期の合計単位数
  const grandTotal = Object.values(totalCredits).reduce((sum, semesterCredits) => sum + semesterCredits, 0);

  return (
    <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">単位取得状況</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          {Object.entries(totalCredits).map(([semester, credits]) => (
            <div key={semester} className="flex justify-between p-2 bg-white rounded border border-gray-100">
              <span>{semester}:</span>
              <span className="font-medium">{credits}単位</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-blue-50 rounded border border-blue-100 flex flex-col items-center justify-center">
          <div className="text-lg text-blue-800">総単位数</div>
          <div className="text-3xl font-bold text-blue-900">{grandTotal}単位</div>
        </div>
      </div>
    </div>
  );
};

export default CreditSummary;