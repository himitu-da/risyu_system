// app/components/SyncIdDisplay.tsx
'use client';

import React, { useState } from 'react';

interface SyncIdDisplayProps {
  syncId: string | null;
}

const SyncIdDisplay: React.FC<SyncIdDisplayProps> = ({ syncId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!syncId) {
    return (
      <div className="mb-4 p-2 bg-yellow-50 rounded border border-yellow-100 text-yellow-800">
        同期用IDはまだ発行されていません。「サーバーに保存」を実行すると発行されます。
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-700 mb-1">同期用ID:</div>
      <div className="flex space-x-2">
        <code className="p-2 bg-gray-100 rounded border border-gray-200 text-gray-800 flex-grow overflow-x-auto">
          {syncId}
        </code>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
    </div>
  );
};

export default SyncIdDisplay;