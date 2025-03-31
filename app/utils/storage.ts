// app/utils/storage.ts

/**
 * アプリケーションで使用する定数定義
 */
export const semesters = [
  '1年春学期', '1年秋学期',
  '2年春学期', '2年秋学期',
  '3年春学期', '3年秋学期',
  '4年春学期', '4年秋学期'
] as const;

export const days = ['月', '火', '水', '木', '金'] as const;
export const periods = [1, 2, 3, 4, 5] as const;

/**
 * 科目情報の型定義
 */
export interface Course {
  /** 科目名 */
  name: string;
  /** 単位数 */
  credits: number;
}

/**
 * 1日の時間割の型定義
 * 時限をキー、科目情報またはnullを値とする
 */
export interface DaySchedule {
  [period: number]: Course | null;
}

/**
 * 1学期分の時間割データの型定義
 * 曜日をキー、DayScheduleを値とする
 */
export interface SemesterData {
  [day: string]: DaySchedule;
}

/**
 * 全学期の時間割データの型定義
 * 学期名をキー、SemesterDataを値とする
 */
export interface SemesterTimetable {
  [semester: string]: SemesterData;
}

/**
 * 空の時間割データ構造を作成
 * @returns 初期化されたSemesterTimetableオブジェクト
 */
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
  
  if (process.env.NODE_ENV === 'development') {
    console.debug('初期化された時間割データ構造');
  }
  
  return timetable;
}

/**
 * ローカルストレージから時間割データを読み込む
 * @param key ストレージキー
 * @param defaultValue データが存在しない場合のデフォルト値
 * @returns 読み込んだデータまたはデフォルト値
 */
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

/**
 * 時間割データをローカルストレージに保存
 * @param key ストレージキー
 * @param data 保存するデータ
 */
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

/**
 * 時間割データをJSONファイルとしてエクスポート
 * @param data エクスポートするデータ
 */
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

/**
 * 指定学期の合計単位数を計算
 * @param timetable 時間割データ
 * @param semester 対象学期
 * @returns 合計単位数
 */
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

/**
 * 全学期の単位数を計算
 * @param timetable 時間割データ
 * @returns 学期ごとの単位数を含むオブジェクト
 */
export function calculateTotalCredits(timetable: SemesterTimetable): Record<string, number> {
  const result: { [semester: string]: number } = {};
  
  semesters.forEach(semester => {
    result[semester] = calculateCredits(timetable, semester);
  });
  
  return result;
}
