import type { Metadata } from 'next';
import './globals.css';
import { FinanceProvider } from '../lib/FinanceContext';
import Sidebar from '../components/Sidebar/Sidebar';

export const metadata: Metadata = {
  title: 'Financial Dashboard',
  description: 'Clean and interactive finance dashboard interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FinanceProvider>
          <div className="min-h-screen w-full">
            <Sidebar />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
