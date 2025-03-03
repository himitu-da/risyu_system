// app/components/CourseForm.tsx
import React, { useState } from 'react';

interface CourseFormProps {
  onAddCourse: (course: { name: string; credits: number; day: string; period: number }) => void;
}

const dayOptions = [
  { value: '月', label: '月曜' },
  { value: '火', label: '火曜' },
  { value: '水', label: '水曜' },
  { value: '木', label: '木曜' },
  { value: '金', label: '金曜' },
];

const periodOptions = [1, 2, 3, 4, 5];

const CourseForm: React.FC<CourseFormProps> = ({ onAddCourse }) => {
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<number>(2);
  const [day, setDay] = useState<string>('月');
  const [period, setPeriod] = useState<number>(1);
  
  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim()) {
      onAddCourse({
        name: name.trim(),
        credits,
        day,
        period
      });
      
      // フォームをリセット
      setName('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="course-name" className="block text-sm font-medium mb-1">
            科目名
          </label>
          <input
            id="course-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="例: 情報科学概論"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            単位数
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCredits(value)}
                className={`py-2 rounded-lg text-center transition-all border ${
                  credits === value
                    ? 'bg-[--primary-light] text-[--primary-dark] font-medium border-[--primary] shadow-sm'
                    : 'bg-[--secondary] text-[--foreground] hover:bg-[--secondary-hover] border-[--border]'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          曜日・時限
        </label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {dayOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDay(option.value)}
              className={`py-2 rounded-lg text-center transition-all border ${
                day === option.value
                  ? 'bg-[--primary-light] text-[--primary-dark] font-medium border-[--primary] shadow-sm'
                  : 'bg-[--secondary] text-[--foreground] hover:bg-[--secondary-hover] border-[--border]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {periodOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`py-2 rounded-lg text-center transition-all border ${
                period === value
                  ? 'bg-[--primary-light] text-[--primary-dark] font-medium border-[--primary] shadow-sm'
                  : 'bg-[--secondary] text-[--foreground] hover:bg-[--secondary-hover] border-[--border]'
              }`}
            >
              {value}限
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim()}
        >
          科目を追加
        </button>
      </div>
    </form>
  );
};

export default CourseForm;