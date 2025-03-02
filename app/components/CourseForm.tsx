// app/components/CourseForm.tsx
'use client';

import React, { useState } from 'react';

interface CourseFormProps {
  onAddCourse: (course: { name: string; credits: number; day: string; period: number }) => void;
}

const days = ['月', '火', '水', '木', '金'];
const periods = [1, 2, 3, 4, 5];

const CourseForm: React.FC<CourseFormProps> = ({ onAddCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState<number>(1);
  const [day, setDay] = useState<string>('月');
  const [period, setPeriod] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseName.trim()) {
      setError('授業名を入力してください');
      return;
    }
    
    onAddCourse({
      name: courseName,
      credits,
      day,
      period
    });
    
    // フォームをリセット
    setCourseName('');
    setError(null);
  };

  return (
    <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">授業を追加</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          {isOpen ? '閉じる ▲' : '開く ▼'}
        </button>
      </div>
      
      {isOpen && (
        <>
          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 border border-red-100 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 授業名入力 */}
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                授業名
              </label>
              <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="授業名を入力してください"
              />
            </div>

            {/* 単位数グリッド選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位数
              </label>
              <div className="grid grid-cols-4 gap-2 max-w-xs">
                {[1, 2, 3, 4].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCredits(value)}
                    className={`p-2 border ${
                      credits === value
                        ? 'bg-blue-500 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } rounded-md text-center transition-colors`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 曜日と時限のグリッド選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                曜日・時限
              </label>
              <div className="grid grid-cols-6 gap-1 max-w-xl">
                {/* 左上の空セル */}
                <div className="text-center font-medium py-1"></div>
                
                {/* ヘッダー行（曜日） */}
                {days.map((d) => (
                  <div key={d} className="text-center font-medium py-1 bg-gray-100">
                    {d}
                  </div>
                ))}
                
                {/* 時限行とそのセル */}
                {periods.map((p) => (
                  <React.Fragment key={p}>
                    {/* 時限番号 */}
                    <div className="text-center font-medium py-1 px-2 bg-gray-100">
                      {p}限
                    </div>
                    
                    {/* 各曜日のセル */}
                    {days.map((d) => {
                      const isSelected = day === d && period === p;
                      return (
                        <button
                          key={`${d}-${p}`}
                          type="button"
                          onClick={() => {
                            setDay(d);
                            setPeriod(p);
                          }}
                          className={`p-2 border ${
                            isSelected
                              ? 'bg-blue-500 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          } rounded-md text-center transition-colors`}
                        >
                          {/* セル内のコンテンツはシンプルに */}
                          {isSelected ? '✓' : ''}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                選択中: {day}曜{period}限
              </div>
            </div>

            {/* 送信ボタン */}
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                追加
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CourseForm;