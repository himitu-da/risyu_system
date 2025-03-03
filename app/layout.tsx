// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import ThemeToggle from './components/ThemeToggle';

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
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="header py-3 px-4">
            <div className="container mx-auto max-w-6xl flex justify-between items-center">
              <div className="text-lg font-medium">履修登録管理システム</div>
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="py-6 px-4 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto max-w-6xl">
              <div className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                © {new Date().getFullYear()} 履修登録管理システム
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}