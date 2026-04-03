"use client";

import { useFinance } from "../lib/FinanceContext";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend
} from 'recharts';
import { useMemo, useEffect, useState } from "react";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { transactions, theme } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { totalBalance, totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      totalBalance: income - expense,
      totalIncome: income,
      totalExpense: expense
    };
  }, [transactions]);

  const spendingsByCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [transactions]);

  const balanceTrend = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 0;
    const trendMap = new Map<string, number>();
    
    sorted.forEach(t => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      trendMap.set(t.date, runningBalance); 
    });

    return Array.from(trendMap).map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance
    }));
  }, [transactions]);

  if (!mounted) return null;

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    borderRadius: '8px'
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="page-title m-0">Dashboard Overview</h1>
        <p className="page-subtitle m-0">Welcome back! Here&apos;s your financial summary.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-blue-900 dark:from-blue-950 dark:to-blue-900">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-300">Total Balance</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-blue-600 dark:bg-white/10 dark:text-blue-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalBalance.toLocaleString()}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-emerald-900 dark:from-emerald-950 dark:to-emerald-900">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-300">Total Income</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-emerald-600 dark:bg-white/10 dark:text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalIncome.toLocaleString()}</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 p-6 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-rose-900 dark:from-rose-950 dark:to-rose-900">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider dark:text-slate-300">Total Expenses</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 text-rose-600 dark:bg-white/10 dark:text-rose-400">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${totalExpense.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="surface-card lg:col-span-2 p-6 lg:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0 mb-6">Balance Trend</h3>
          <div className="h-[300px] flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <LineTooltip 
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: tooltipStyle.color }}
                />
                <Line type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card lg:col-span-1 p-6 lg:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0 mb-6">Spending Breakdown</h3>
          <div className="h-[300px] flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {spendingsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip 
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: tooltipStyle.color }}
                  formatter={(value: any) => `$${value}`}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
