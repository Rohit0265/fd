import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FinanceProvider } from '../lib/FinanceContext';
import Sidebar from '../components/Sidebar/Sidebar';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <FinanceProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <main className="flex-1 md:ml-[260px] p-4 pb-24 md:p-8 md:pb-8 max-w-full md:max-w-[calc(100vw-260px)]">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}
