// app/components/CourseForm.tsx
import React, { useState } from 'react';
import { days, periods } from '../utils/storage';

interface CourseFormProps {
  onAddCourse: (course: { name: string; credits: number; day: string; period: number }) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onAddCourse }) => {
  const [course, setCourse] = useState({
    name: '',
    credits: 2,
    day: days[0],
    period: periods[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.name) return;
    
    onAddCourse(course);
    setCourse({ ...course, name: '' });
  };

  return (
    <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">科目登録</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div>
          <label className="block text-sm mb-1 text-gray-700">科目名:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={course.name}
            onChange={(e) => setCourse({ ...course, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">単位数:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={course.credits}
            onChange={(e) => setCourse({ ...course, credits: Number(e.target.value) })}
          >
            {[1, 2, 3, 4].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">曜日:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={course.day}
            onChange={(e) => setCourse({ ...course, day: e.target.value })}
          >
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 text-gray-700">時限:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={course.period}
            onChange={(e) => setCourse({ ...course, period: Number(e.target.value) })}
          >
            {periods.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            追加
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;