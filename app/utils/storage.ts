// app/utils/storage.ts

// 学期のリスト
export const semesters = [
  '1年春学期', '1年秋学期', 
  '2年春学期', '2年秋学期', 
  '3年春学期', '3年秋学期', 
  '4年春学期', '4年秋学期'
];

// 曜日のリスト
export const days = ['月', '火', '水', '木', '金'];

// 時限のリスト
export const periods = [1, 2, 3, 4, 5];

// 科目の型定義
export interface Course {
  name: string;
  credits: number;
}

// 一日の時間割の型定義
export interface DaySchedule {
  [period: number]: Course | null;
}

// 一つの学期の時間割の型定義
export interface SemesterData {
  [day: string]: DaySchedule;
}

// 全学期の時間割の型定義
export interface SemesterTimetable {
  [semester: string]: SemesterData;
}

// 初期の時間割データを作成する関数
export function createInitialTimetable(): SemesterTimetable {
  const timetable: SemesterTimetable = {};
  
  // 各学期について
  semesters.forEach(semester => {
    timetable[semester] = {};
    
    // 各曜日について
    days.forEach(day => {
      timetable[semester][day] = {};
      
      // 各時限について (明示的に数値キーに変換)
      periods.forEach(period => {
        timetable[semester][day][period] = null;
      });
    });
  });
  
  // データ構造が確実に初期化されているか確認
  console.log('初期化された時間割:', JSON.stringify(timetable, null, 2).substring(0, 500) + '...');
  
  return timetable;
}

// ローカルストレージからデータを読み込む関数
export function loadFromLocalStorage(key: string, defaultValue: SemesterTimetable): SemesterTimetable {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('ローカルストレージからの読み込みエラー:', error);
    return defaultValue;
  }
}

// ローカルストレージにデータを保存する関数
export function saveToLocalStorage(key: string, data: SemesterTimetable): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('ローカルストレージへの保存エラー:', error);
  }
}

// データをファイルにエクスポートする関数
export function exportToFile(data: SemesterTimetable): void {
  try {
    const serializedData = JSON.stringify(data, null, 2);
    const blob = new Blob([serializedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `履修登録_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // クリーンアップ
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    console.error('ファイルエクスポートエラー:', error);
    alert('ファイルのエクスポートに失敗しました');
  }
}

// 特定の学期の単位数を計算する関数
export function calculateCredits(timetable: SemesterTimetable, semester: string): number {
  let total = 0;
  
  const semesterData = timetable[semester];
  if (!semesterData) return 0;
  
  Object.values(semesterData).forEach(daySchedule => {
    Object.values(daySchedule).forEach(course => {
      if (course) {
        total += course.credits;
      }
    });
  });
  
  return total;
}

// 全学期の単位数を計算する関数
export function calculateTotalCredits(timetable: SemesterTimetable): { [semester: string]: number } {
  const result: { [semester: string]: number } = {};
  
  semesters.forEach(semester => {
    result[semester] = calculateCredits(timetable, semester);
  });
  
  return result;
}