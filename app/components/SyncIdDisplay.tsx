// app/components/SyncIdDisplay.tsx
import React, { useState, useEffect } from 'react';

const SyncIdDisplay = () => {
  const [syncId, setSyncId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // コンポーネントがマウントされたときにlocalStorageから同期用IDを取得
    const id = localStorage.getItem('syncId');
    setSyncId(id);
    
    // localStorageの変更を監視するためのイベントリスナー
    const handleStorageChange = () => {
      const updatedId = localStorage.getItem('syncId');
      setSyncId(updatedId);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // イベントリスナーのクリーンアップ
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const copyToClipboard = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後にコピー状態をリセット
    }
  };

  // 同期用IDがない場合は何も表示しない
  if (!syncId) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
      <h3 className="text-md font-semibold mb-2">同期用ID</h3>
      <div className="flex items-center">
        <code className="bg-gray-100 px-2 py-1 rounded mr-2 flex-grow overflow-x-auto text-sm">{syncId}</code>
        <button
          onClick={copyToClipboard}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          title="クリップボードにコピー"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
    </div>
  );
};

export default SyncIdDisplay;