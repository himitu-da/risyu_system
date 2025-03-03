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
  // 状態の初期化
  const [timetable, setTimetable] = useState<SemesterTimetable | null>(null);
  const [currentSemester, setCurrentSemester] = useState(semesters[0]);
  const [syncStatus, setSyncStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncId, setSyncId] = useState<string | null>(null); // 同期用IDの状態を追加
  const [isFormOpen, setIsFormOpen] = useState(true); // 追加: フォームの開閉状態

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

  // 科目を追加する関数
  const handleAddCourse = (course: { name: string; credits: number; day: string; period: number }) => {
    if (!timetable) return;
    
    // ディープコピーを作成
    const updatedTimetable = JSON.parse(JSON.stringify(timetable));
    
    // 必要なネストされたオブジェクトが存在することを確認
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
  
  // 科目を削除する関数
  const handleRemoveCourse = (day: string, period: number) => {
    if (!timetable) return;
    
    const updatedTimetable = { ...timetable };
    updatedTimetable[currentSemester][day][period] = null;
    setTimetable(updatedTimetable);
  };

  // サーバーに同期する関数
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

  // サーバーからデータを読み込む関数
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

  // 同期モーダルを開く
  const openSyncModal = () => {
    setIsSyncModalOpen(true);
  };

  // 同期IDが入力されてモーダルからサブミットされたとき
  const handleSyncSubmit = (inputSyncId: string) => {
    setIsSyncModalOpen(false);
    restoreFromServer(inputSyncId);
  };

  // ファイルからインポートする関数
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

  // フォームの開閉を切り替える関数
  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

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