// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '履修登録管理システム',
  description: '大学の履修科目を簡単に管理できるシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* 背景色をbg-whiteに変更 */}
      <body className="min-h-screen bg-white">
        {children}
        <footer className="container mx-auto py-4 px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 履修登録管理システム
        </footer>
      </body>
    </html>
  );
}