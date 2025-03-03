// app/components/SyncIdDisplay.tsx
import React, { useState } from 'react';

interface SyncIdDisplayProps {
  syncId: string | null;
}

const SyncIdDisplay: React.FC<SyncIdDisplayProps> = ({ syncId }) => {
  const [copied, setCopied] = useState(false);
  
  // IDをクリップボードにコピーする関数
  const copyToClipboard = () => {
    if (!syncId) return;
    
    navigator.clipboard.writeText(syncId)
      .then(() => {
        setCopied(true);
        // 3秒後にコピー状態をリセット
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };
  
  if (!syncId) return null;
  
  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
        <h3 className="text-sm font-medium">同期ID:</h3>
        <div className="flex items-center flex-grow">
          <code className="px-3 py-1.5 rounded-l-lg bg-[--secondary] text-sm font-mono flex-grow overflow-x-auto whitespace-nowrap">
            {syncId}
          </code>
          <button
            onClick={copyToClipboard}
            className={`px-3 py-1.5 rounded-r-lg transition-colors ${
              copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-[--primary] text-white hover:bg-[--primary-hover]'
            }`}
            title="IDをコピー"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-[--muted-foreground]">
        この同期IDを使用して、他のデバイスからデータを同期できます。IDを安全に保管してください。
      </p>
    </div>
  );
};

export default SyncIdDisplay;