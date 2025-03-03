// app/components/CreditSummary.tsx
import React from 'react';
import { semesters } from '../utils/storage';

interface CreditSummaryProps {
  timetable: any;
  totalCredits: { [key: string]: number };
}

const CreditSummary: React.FC<CreditSummaryProps> = ({ timetable, totalCredits }) => {
  // 全学期の合計単位数を計算
  const grandTotal = Object.values(totalCredits).reduce((sum, current) => sum + current, 0);
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">学期別単位数</h3>
          <div className="space-y-2">
            {semesters.map((semester) => (
              <div key={semester} className="flex justify-between items-center p-2 rounded-lg bg-[--secondary]">
                <span className="text-sm">{semester}</span>
                <span className="font-medium">{totalCredits[semester] || 0}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">総単位数</h3>
          <div className="p-4 rounded-lg bg-[--secondary] flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-[--primary]">{grandTotal}</div>
              <div className="text-xs text-[--muted-foreground] mt-1">単位</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-2 bg-[--muted] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[--primary] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min((grandTotal / 124) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[--muted-foreground] mt-1">
              <span>0</span>
              <span>卒業要件: 124単位</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditSummary;