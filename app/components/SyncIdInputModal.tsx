// app/components/SyncIdInputModal.tsx
import React, { useState, useEffect, useRef } from 'react';

interface SyncIdInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (syncId: string) => void;
}

const SyncIdInputModal: React.FC<SyncIdInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // モーダルが開いたら入力フィールドにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setInputValue('');
    }
  }, [isOpen]);
  
  // Escキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md p-6 rounded-2xl bg-[--card-background] shadow-xl border border-[--border]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-[--secondary] transition-colors"
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="text-xl font-medium mb-4">同期IDの入力</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="syncId" className="block text-sm font-medium mb-1 text-[--foreground]">
              同期ID
            </label>
            <input
              ref={inputRef}
              id="syncId"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="form-input"
              placeholder="同期IDを入力してください"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={!inputValue.trim()}
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