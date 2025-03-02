// app/components/Timetable.tsx
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

interface TimetableProps {
  semester: string;
  timetable: {
    [semester: string]: SemesterData;
  };
  totalCredits: number;
  onRemoveCourse: (day: string, period: number) => void;
}

const Timetable: React.FC<TimetableProps> = ({
  semester,
  timetable,
  totalCredits,
  onRemoveCourse,
}) => {
  const days = ['月', '火', '水', '木', '金'];
  const periods = [1, 2, 3, 4, 5];

  return (
    <div className="my-6">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        {semester} 時間割表 (総単位数: {totalCredits})
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300"></th>
              {days.map((day) => (
                <th key={day} className="p-2 border border-gray-300">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td className="p-2 border border-gray-300 font-medium bg-gray-50">
                  {period}限
                </td>
                {days.map((day) => {
                  const course = timetable[semester]?.[day]?.[period] || null;
                  return (
                    <td 
                      key={`${day}-${period}`} 
                      className="p-2 border border-gray-300 min-w-[120px] h-24 align-top"
                    >
                      {course ? (
                        <div className="relative h-full">
                          <div className="bg-blue-50 p-2 rounded h-full">
                            <div className="font-medium text-blue-800">
                              {course.name}
                            </div>
                            <div className="text-sm text-blue-600 mt-1">
                              {course.credits}単位
                            </div>
                            <button
                              onClick={() => onRemoveCourse(day, period)}
                              className="absolute bottom-1 right-1 text-xs p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;