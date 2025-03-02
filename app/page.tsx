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

  // コンポーネントのマウント時にデータをロード
  useEffect(() => {
    const savedData = loadFromLocalStorage('courseRegistration', createInitialTimetable());
    setTimetable(savedData);
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
    
    const updatedTimetable = { ...timetable };
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
      
      console.log('同期リクエスト送信先:', '/api/sync');
      
      const syncId = localStorage.getItem('syncId');
      console.log('現在のsyncId:', syncId || 'なし');
      
      const requestData = {
        data: timetable,
        id: syncId
      };
      
      console.log('送信データ:', requestData);
      
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('HTTPステータス:', response.status);
      
      // 応答がJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('非JSONレスポンス:', textResponse.substring(0, 150) + '...');
        setSyncStatus('エラー: サーバーからの応答が正しくありません。管理者に連絡してください。');
        return;
      }
      
      const result = await response.json();
      console.log('パース済みレスポンス:', result);
      
      if (response.ok && result.success) {
        setSyncStatus(`同期完了: ${new Date().toLocaleTimeString()}`);
        // 結果からIDを取得して保存しておく
        if (result.id) {
          localStorage.setItem('syncId', result.id);
          console.log('新しいsyncIdを保存:', result.id);
        }
      } else {
        setSyncStatus(`エラー: ${result.message || '同期に失敗しました'}`);
      }
    } catch (error: any) {
      console.error('同期エラー:', error);
      setSyncStatus(`エラー: ${error.message}`);
    }
  };

  // サーバーからデータを復元する関数
  const restoreFromServer = async (customSyncId?: string) => {
    let syncId = customSyncId || localStorage.getItem('syncId');
    
    if (!syncId) {
      setSyncStatus('同期IDが見つかりません');
      return;
    }
    
    try {
      setSyncStatus('データ取得中...');
      
      console.log('データ取得リクエスト送信先:', `/api/sync?id=${syncId}`);
      
      const response = await fetch(`/api/sync?id=${syncId}`);
      
      // 応答がJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('非JSONレスポンス:', textResponse.substring(0, 150) + '...');
        setSyncStatus('エラー: サーバーからの応答が正しくありません。管理者に連絡してください。');
        return;
      }
      
      const result = await response.json();
      console.log('パース済みレスポンス:', result);
      
      if (response.ok && result.data) {
        setTimetable(result.data);
        // カスタム同期IDを使用している場合、localStorageに保存
        if (customSyncId) {
          localStorage.setItem('syncId', customSyncId);
        }
        setSyncStatus(`復元完了: ${new Date().toLocaleTimeString()}`);
      } else {
        setSyncStatus(`エラー: ${result.message || 'データの取得に失敗しました'}`);
      }
    } catch (error: any) {
      console.error('復元エラー:', error);
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-gray-800">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl bg-white text-gray-800">
      <h1 className="text-2xl font-bold mb-4">履修登録管理</h1>
      
      {/* 学期選択 */}
      <SemesterSelector
        currentSemester={currentSemester}
        onChange={setCurrentSemester}
      />
      
      {/* 科目登録フォーム */}
      <CourseForm onAddCourse={handleAddCourse} />
      
      {/* 時間割表示 */}
      {timetable && (
        <Timetable
          semester={currentSemester}
          timetable={timetable}
          totalCredits={calculateCredits(timetable, currentSemester)}
          onRemoveCourse={handleRemoveCourse}
        />
      )}
      
      {/* 全体単位数の表示 */}
      {timetable && (
        <CreditSummary
          timetable={timetable}
          totalCredits={calculateTotalCredits(timetable)}
        />
      )}

      {/* データ同期とインポート/エクスポート */}
      <div className="p-4 bg-gray-50 rounded mb-4 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">データ管理</h2>
        
        {/* 同期用ID表示 */}
        <SyncIdDisplay />
        
        {/* 同期ステータス表示 */}
        {syncStatus && (
          <div className="mb-2 text-sm p-2 bg-blue-50 rounded border border-blue-100 text-blue-800">{syncStatus}</div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={syncToServer}
          >
            サーバーに保存
          </button>
          <button
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            onClick={openSyncModal}
          >
            サーバーから復元
          </button>
          <button
            className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            onClick={() => timetable && exportToFile(timetable)}
          >
            ファイルにエクスポート
          </button>
          <label className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
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
      
      {/* 同期用ID入力モーダル */}
      <SyncIdInputModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSubmit={handleSyncSubmit}
      />
    </div>
  );
}