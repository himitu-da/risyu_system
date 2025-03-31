// app/components/SemesterSelector.tsx
import React from 'react';
import { semesters } from '../utils/storage';

/**
 * 学期選択コンポーネントのプロパティ定義
 */
interface SemesterSelectorProps {
  /** 現在選択されている学期 */
  currentSemester: typeof semesters[number];
  /** 学期が変更された時のコールバック */
  onChange: (semester: typeof semesters[number]) => void;
}

// スタイルクラスの定義
const BASE_BUTTON_CLASS = 'py-2 px-4 rounded-lg text-center transition-all border';
const ACTIVE_BUTTON_CLASS = 'bg-[--button-active-bg] text-[--button-active-fg] font-medium border-[--button-active-border] shadow-sm';
const INACTIVE_BUTTON_CLASS = 'bg-[--secondary] text-[--foreground] hover:bg-[--secondary-hover] border-[--border]';

const SemesterSelector: React.FC<SemesterSelectorProps> = ({ currentSemester, onChange }) => {
  return (
    <div className="mb-2">
      {/* 学期選択のラベル */}
      <label htmlFor="semester-select" className="block text-sm font-medium mb-2">
        学期
      </label>
      
      {/* 学期選択ボタングリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {semesters.map((semester) => (
          <button
            key={semester}
            onClick={() => onChange(semester)}
            className={`${BASE_BUTTON_CLASS} ${
              currentSemester === semester 
                ? ACTIVE_BUTTON_CLASS 
                : INACTIVE_BUTTON_CLASS
            }`}
            aria-label={`${semester}を選択`}
          >
            {semester}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SemesterSelector;
