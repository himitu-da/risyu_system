// app/components/SyncIdInputModal.tsx
'use client';

import React, { useState } from 'react';

interface SyncIdInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (syncId: string) => void;
}

const SyncIdInputModal: React.FC<SyncIdInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputSyncId, setInputSyncId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputSyncId.trim()) {
      setError('同期用IDを入力してください');
      return;
    }
    
    onSubmit(inputSyncId.trim());
    setInputSyncId('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">サーバーから読み込み</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="syncId" className="block text-sm font-medium text-gray-700 mb-1">
              同期用ID
            </label>
            <input
              type="text"
              id="syncId"
              value={inputSyncId}
              onChange={(e) => setInputSyncId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="同期用IDを入力してください"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              読み込む
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SyncIdInputModal;