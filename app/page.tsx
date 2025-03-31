// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SemesterSelector from './components/SemesterSelector';
import CourseForm from './components/CourseForm';
import Timetable from './components/Timetable';
import CreditSummary from './components/CreditSummary';
import SyncIdDisplay from './components/SyncIdDisplay';
import SyncIdInputModal from './components/SyncIdInputModal';
import {
  createInitialTimetable,
  loadFromLocalStorage,
  saveToLocalStorage,
  exportToFile,
  calculateCredits,
  calculateTotalCredits,
  semesters,
  SemesterTimetable
} from './utils/storage';

export default function Home() {
  // アプリケーションの主要な状態管理
  const [timetable, setTimetable] = useState<SemesterTimetable | null>(null);
  const [currentSemester, setCurrentSemester] = useState<typeof semesters[number]>(semesters[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  // データ同期関連の状態
  const [syncStatus, setSyncStatus] = useState('');
  const [syncId, setSyncId] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  
  // UI関連の状態
  const [isFormOpen, setIsFormOpen] = useState(true);

  // コンポーネントのマウント時にデータとsyncIdをロード
  useEffect(() => {
    const savedData = loadFromLocalStorage('courseRegistration', createInitialTimetable());
    const savedSyncId = localStorage.getItem('syncId');
    
    setTimetable(savedData);
    setSyncId(savedSyncId);
    setIsLoading(false);
  }, []);

  // データ変更時にローカルストレージに保存
  useEffect(() => {
    if (timetable && !isLoading) {
      saveToLocalStorage('courseRegistration', timetable);
    }
  }, [timetable, isLoading]);

  /**
   * 科目を時間割に追加する
   * @param course 追加する科目情報 (名前、単位数、曜日、時限)
   */
  const handleAddCourse = (course: { name: string; credits: number; day: string; period: number }) => {
    if (!timetable) return;
    
    // イミュータブルな更新のためにディープコピーを作成
    const updatedTimetable = JSON.parse(JSON.stringify(timetable));
    
    // 必要なデータ構造が存在しない場合は初期化
    if (!updatedTimetable[currentSemester]) {
      updatedTimetable[currentSemester] = {};
    }
    
    if (!updatedTimetable[currentSemester][course.day]) {
      updatedTimetable[currentSemester][course.day] = {};
    }
    
    // 科目を追加
    updatedTimetable[currentSemester][course.day][course.period] = {
      name: course.name,
      credits: course.credits
    };
    
    setTimetable(updatedTimetable);
  };
  
  /**
   * 科目を時間割から削除する
   * @param day 曜日
   * @param period 時限
   */
  const handleRemoveCourse = (day: string, period: number) => {
    if (!timetable) return;

    // イミュータブルな更新のためにディープコピーを作成
    const updatedTimetable = JSON.parse(JSON.stringify(timetable));

    // 該当の科目を削除 (nullに設定)
    if (updatedTimetable[currentSemester]?.[day]) {
      updatedTimetable[currentSemester][day][period] = null;
    }
    
    setTimetable(updatedTimetable);
  };

  /**
   * 科目を移動する
   * @param source 移動元の曜日と時限
   * @param destination 移動先の曜日と時限
   */
  const handleMoveCourse = (
    source: {day: string; period: number},
    destination: {day: string; period: number}
  ) => {
    if (!timetable) return;

    // イミュータブルな更新のためにディープコピーを作成
    const updatedTimetable = JSON.parse(JSON.stringify(timetable));

    // 移動元と移動先の科目を取得
    const sourceCourse = updatedTimetable[currentSemester]?.[source.day]?.[source.period] || null;
    const destinationCourse = updatedTimetable[currentSemester]?.[destination.day]?.[destination.period] || null;

    // 移動元と移動先のデータ構造が存在しない場合は初期化
    if (!updatedTimetable[currentSemester]) updatedTimetable[currentSemester] = {};
    if (!updatedTimetable[currentSemester][source.day]) updatedTimetable[currentSemester][source.day] = {};
    if (!updatedTimetable[currentSemester][destination.day]) updatedTimetable[currentSemester][destination.day] = {};

    // 科目を入れ替え
    updatedTimetable[currentSemester][destination.day][destination.period] = sourceCourse;
    updatedTimetable[currentSemester][source.day][source.period] = destinationCourse; // 移動元には移動先の科目を入れる (nullの場合もある)
    
    setTimetable(updatedTimetable);
  };

  /**
   * 時間割データをサーバーに保存
   */
  const syncToServer = async () => {
    if (!timetable) return;
    
    try {
      setSyncStatus('同期中...');
      
      const requestData = {
        data: timetable,
        id: syncId
      };
      
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      // 応答がJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        setSyncStatus('エラー: サーバーからの応答が正しくありません。管理者に連絡してください。');
        return;
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSyncStatus(`同期完了: ${new Date().toLocaleTimeString()}`);
        // 結果からIDを取得して保存し、状態も更新
        if (result.id) {
          localStorage.setItem('syncId', result.id);
          setSyncId(result.id); // 状態も更新
        }
      } else {
        setSyncStatus(`エラー: ${result.message || '同期に失敗しました'}`);
      }
    } catch (error: any) {
      console.error('同期エラー:', error);
      setSyncStatus(`エラー: ${error.message}`);
    }
  };

  /**
   * サーバーから時間割データを取得
   * @param customSyncId 使用する同期ID (オプション)
   */
  const restoreFromServer = async (customSyncId?: string) => {
    let idToUse = customSyncId || syncId;
    
    if (!idToUse) {
      setSyncStatus('同期IDが見つかりません');
      return;
    }
    
    try {
      setSyncStatus('データ取得中...');
      
      const response = await fetch(`/api/sync?id=${idToUse}`);
      
      // 応答がJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        setSyncStatus('エラー: サーバーからの応答が正しくありません。管理者に連絡してください。');
        return;
      }
      
      const result = await response.json();
      
      if (response.ok && result.data) {
        setTimetable(result.data);
        // 読み込み成功した場合は、常に使用した同期IDをlocalStorageに保存し、状態も更新
        localStorage.setItem('syncId', idToUse);
        setSyncId(idToUse); // 状態も更新
        setSyncStatus(`読み込み完了: ${new Date().toLocaleTimeString()}`);
      } else {
        setSyncStatus(`エラー: ${result.message || 'データの取得に失敗しました'}`);
      }
    } catch (error: any) {
      console.error('読み込みエラー:', error);
      setSyncStatus(`エラー: ${error.message}`);
    }
  };

  /**
   * 同期モーダルを開く
   */
  const openSyncModal = () => setIsSyncModalOpen(true);

  /**
   * 同期IDを送信してデータを取得
   * @param inputSyncId 入力された同期ID
   */
  const handleSyncSubmit = (inputSyncId: string) => {
    setIsSyncModalOpen(false);
    restoreFromServer(inputSyncId);
  };

  /**
   * JSONファイルから時間割をインポート
   * @param event ファイル入力イベント
   */
  const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedData = JSON.parse(result);
          setTimetable(importedData);
          setSyncStatus(`インポート完了: ${file.name}`);
        }
      } catch (error) {
        setSyncStatus('ファイルの解析に失敗しました');
      }
    };
    reader.readAsText(file);
  };

  /**
   * 科目登録フォームの表示を切り替え
   */
  const toggleForm = () => setIsFormOpen(!isFormOpen);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[--background]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-[--primary] border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-[--foreground] font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background] py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>履修登録管理</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>あなたの履修計画を効率的に管理します</p>
        </header>
        
        {/* 学期選択 */}
        <section className="mb-6">
          <SemesterSelector
            currentSemester={currentSemester}
            onChange={setCurrentSemester}
          />
        </section>
        
        {/* 科目登録フォーム - トグルボタン追加 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-medium">科目登録</h2>
            <button 
              onClick={toggleForm}
              className="btn btn-secondary text-sm px-3 py-1.5"
            >
              {isFormOpen ? '閉じる' : '開く'}
            </button>
          </div>
          
          {isFormOpen && (
            <div className="card p-4 transition-all duration-300 ease-in-out">
              <CourseForm onAddCourse={handleAddCourse} />
            </div>
          )}
        </section>
        
        {/* 時間割表示 */}
        {timetable && (
          <section className="mb-8">
            <h2 className="text-xl font-medium mb-3">時間割</h2>
            <div className="card overflow-hidden">
              <Timetable
                semester={currentSemester}
                timetable={timetable}
                totalCredits={calculateCredits(timetable, currentSemester)}
                onRemoveCourse={handleRemoveCourse}
                onMoveCourse={handleMoveCourse}
              />
            </div>
          </section>
        )}
        
        {/* 全体単位数の表示 */}
        {timetable && (
          <section className="mb-8">
            <h2 className="text-xl font-medium mb-3">単位サマリー</h2>
            <div className="card p-4">
              <CreditSummary
                timetable={timetable}
                totalCredits={calculateTotalCredits(timetable)}
              />
            </div>
          </section>
        )}

        {/* データ同期とインポート/エクスポート */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-3">データ管理</h2>
          <div className="card p-5">
            {/* 同期用ID表示 */}
            <SyncIdDisplay syncId={syncId} />
            
            {/* 同期ステータス表示 */}
            {syncStatus && (
              <div className="mb-4 p-3 rounded-lg bg-[--secondary] text-sm">
                <div className={`flex items-center ${syncStatus.includes('エラー') ? 'text-red-500' : 'text-[--primary]'}`}>
                  <span className="font-medium">{syncStatus}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="btn btn-primary"
                onClick={syncToServer}
              >
                サーバーに保存
              </button>
              <button
                className="btn btn-secondary"
                onClick={openSyncModal}
              >
                サーバーから読み込み
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => timetable && exportToFile(timetable)}
              >
                ファイルにエクスポート
              </button>
              <label className="btn btn-secondary text-center cursor-pointer inline-flex items-center justify-center">
                ファイルからインポート
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importFromFile}
                />
              </label>
            </div>
          </div>
        </section>
        
        {/* 同期用ID入力モーダル */}
        <SyncIdInputModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          onSubmit={handleSyncSubmit}
        />
      </div>
    </div>
  );
}
