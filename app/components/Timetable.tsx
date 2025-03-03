// app/components/Timetable.tsx
import React from 'react';

interface TimetableProps {
  semester: string;
  timetable: any;
  totalCredits: number;
  onRemoveCourse: (day: string, period: number) => void;
}

const Timetable: React.FC<TimetableProps> = ({ semester, timetable, totalCredits, onRemoveCourse }) => {
  const days = ['月', '火', '水', '木', '金'];
  const periods = [1, 2, 3, 4, 5];
  
  // 特定の学期、曜日、時限の科目を取得
  const getCourse = (day: string, period: number) => {
    if (!timetable[semester] || !timetable[semester][day]) {
      return null;
    }
    return timetable[semester][day][period] || null;
  };
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-[--secondary]">
              <th className="p-3 text-left font-medium text-[--muted-foreground] w-16"></th>
              {days.map((day) => (
                <th key={day} className="p-3 text-center font-medium text-[--muted-foreground] w-1/5">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period} className="border-b border-[--border] min-h-[4.5rem]">
                <td className="p-3 font-medium text-[--muted-foreground] bg-[--secondary]">
                  {period}限
                </td>
                {days.map((day) => {
                  const course = getCourse(day, period);
                  return (
                    <td key={day} className="p-2 border-r border-[--border] align-top">
                      {course ? (
                        <div className="flex flex-col min-h-[4rem] p-2 rounded-lg bg-[--card-background] border border-[--border] shadow-sm">
                          <div className="font-medium text-sm flex-grow line-clamp-3 overflow-hidden">
                            {course.name}
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1.5">
                            <span className="text-xs text-[--muted-foreground]">{course.credits}単位</span>
                            <button
                              onClick={() => onRemoveCourse(day, period)}
                              className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="科目を削除"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center min-h-[4rem] text-[--muted-foreground] text-sm">
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
      
      <div className="mt-4 p-3 bg-[--secondary] rounded-lg flex justify-end">
        <div className="font-medium">
          <span className="text-[--muted-foreground]">合計単位数:</span>{' '}
          <span className="text-[--primary] text-lg">{totalCredits}</span>
        </div>
      </div>
    </div>
  );
};

export default Timetable;