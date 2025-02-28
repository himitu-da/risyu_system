// app/utils/storage.ts
import { v4 as uuidv4 } from 'uuid';

// 時間割のデータ型定義
export interface Course {
  name: string;
  credits: number;
}

export interface TimetableSlot {
  [period: number]: Course | null;
}

export interface DayTimetable {
  [day: string]: TimetableSlot;
}

export interface SemesterTimetable {
  [semester: string]: DayTimetable;
}

// 定数定義
export const semesters = [
  '1年前期', '1年後期', '2年前期', '2年後期',
  '3年前期', '3年後期', '4年前期', '4年後期'
];

export const days = ['月曜', '火曜', '水曜', '木曜', '金曜'];
export const periods = [1, 2, 3, 4, 5];

// 初期時間割データの作成
export const createInitialTimetable = (): SemesterTimetable => {
  const initial: SemesterTimetable = {};
  semesters.forEach(semester => {
    initial[semester] = {};
    days.forEach(day => {
      initial[semester][day] = {};
      periods.forEach(period => {
        initial[semester][day][period] = null;
      });
    });
  });
  return initial;
};

// ローカルストレージからデータを読み込む
export const loadFromLocalStorage = (key: string, defaultValue: any = null): any => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse data from localStorage:', e);
      }
    }
  }
  return defaultValue;
};

// ローカルストレージにデータを保存
export const saveToLocalStorage = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// ファイルへのエクスポート
export const exportToFile = (data: any, filename: string = 'course_registration.json'): void => {
  const dataStr = JSON.stringify(data);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', dataUri);
  downloadLink.setAttribute('download', filename);
  downloadLink.click();
};

// 単位数計算
export const calculateCredits = (timetable: SemesterTimetable, semester: string): number => {
  let total = 0;
  
  if (!timetable[semester]) return 0;
  
  Object.keys(timetable[semester]).forEach(day => {
    Object.keys(timetable[semester][day]).forEach(period => {
      const course = timetable[semester][day][Number(period)];
      if (course) {
        total += course.credits;
      }
    });
  });
  
  return total;
};

// 全学期の単位数計算
export const calculateTotalCredits = (timetable: SemesterTimetable): number => {
  return semesters.reduce((total, semester) => {
    return total + calculateCredits(timetable, semester);
  }, 0);
};