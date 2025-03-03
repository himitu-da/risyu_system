// app/components/ThemeToggle.tsx
'use client';

import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  // テーマの状態管理
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // 初期ロード時にシステム設定や保存された設定を確認
  useEffect(() => {
    // ローカルストレージから設定を取得
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // 保存された設定がある場合はそれを使用
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } 
    // なければシステム設定を確認
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // テーマを切り替える関数
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // HTML要素にデータ属性を設定
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 設定をローカルストレージに保存
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'ダークモードに切り替え' : 'ライトモードに切り替え'}
      className="p-2 rounded-full transition-colors hover:bg-opacity-20"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {theme === 'light' ? (
        // 月アイコン（ダークモードへの切り替え）
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        // 太陽アイコン（ライトモードへの切り替え）
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;