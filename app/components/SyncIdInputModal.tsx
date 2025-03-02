// app/components/SyncIdInputModal.tsx
import React, { useState, useRef, useEffect } from 'react';

interface SyncIdInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (syncId: string) => void;
}

const SyncIdInputModal = ({ isOpen, onClose, onSubmit }: SyncIdInputModalProps) => {
  const [inputSyncId, setInputSyncId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // モーダルが開いたらフォーカスを入力フィールドに設定
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSyncId.trim()) {
      onSubmit(inputSyncId.trim());
      setInputSyncId(''); // 送信後に入力フィールドをクリア
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // モーダル外のクリックでモーダルを閉じる（ただしモーダル自体のクリックでは閉じない）
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">同期用IDの入力</h2>
        <p className="text-gray-600 mb-4">他の端末で表示された同期用IDを入力して、データを同期できます。</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="syncId" className="block text-sm font-medium text-gray-700 mb-1">
              同期用ID
            </label>
            <input
              ref={inputRef}
              type="text"
              id="syncId"
              value={inputSyncId}
              onChange={(e) => setInputSyncId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="同期用IDを入力してください"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!inputSyncId.trim()}
            >
              同期
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SyncIdInputModal;