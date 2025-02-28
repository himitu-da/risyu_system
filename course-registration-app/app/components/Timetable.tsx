// app/components/Timetable.tsx
import React from 'react';
import { days, periods, Course } from '../utils/storage';

interface TimetableProps {
  semester: string;
  timetable: any;
  totalCredits: number;
  onRemoveCourse: (day: string, period: number) => void;
}

const Timetable: React.FC<TimetableProps> = ({ semester, timetable, totalCredits, onRemoveCourse }) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">
        {semester} 時間割 (合計: {totalCredits}単位)
      </h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-2 text-gray-700">時限 / 曜日</th>
              {days.map((day) => (
                <th key={day} className="border border-gray-200 p-2 text-gray-700">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-2 text-center text-gray-700 bg-gray-50">{period}</td>
                {days.map((day) => {
                  const course = timetable?.[semester]?.[day]?.[period] as Course | null;
                  return (
                    <td key={day} className="border border-gray-200 p-2 relative min-h-16 min-w-24">
                      {course ? (
                        <div className="p-2 bg-blue-50 rounded border border-blue-100">
                          <div className="font-semibold text-gray-800">{course.name}</div>
                          <div className="text-sm text-gray-600">{course.credits}単位</div>
                          <button
                            className="absolute top-1 right-1 text-red-500 text-sm hover:text-red-700"
                            onClick={() => onRemoveCourse(day, period)}
                            aria-label="削除"
                          >
                            ×
                          </button>
                        </div>
                      ) : null}
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