// app/components/SyncIdDisplay.tsx
import React, { useState } from 'react';

interface SyncIdDisplayProps {
  syncId: string | null;
}

const SyncIdDisplay: React.FC<SyncIdDisplayProps> = ({ syncId }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!syncId) {
    return (
      <div className="mb-2 text-sm p-2 bg-yellow-50 rounded border border-yellow-100 text-yellow-800">
        同期用IDが未設定です。「サーバーに保存」を行うと同期用IDが生成されます。
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center">
      <div className="font-mono bg-gray-100 p-2 rounded flex-1 border border-gray-300 overflow-auto">
        <span className="text-sm">同期用ID: {syncId}</span>
      </div>
      <button
        onClick={handleCopy}
        className="ml-2 p-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-sm"
      >
        {isCopied ? '✓ コピー済' : 'コピー'}
      </button>
    </div>
  );
};

export default SyncIdDisplay;