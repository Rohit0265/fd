"use client";

import { useMemo, useState, useEffect } from "react";
import { useFinance } from "../../lib/FinanceContext";
import { TrendingUp, TrendingDown, AlertCircle, Award } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function InsightsPage() {
  const { transactions, theme } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const insights = useMemo(() => {
    if (transactions.length === 0) return null;

    const expenses = transactions.filter(t => t.type === 'expense');

    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const highestCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let currentMonthExpense = 0;
    let prevMonthExpense = 0;

    expenses.forEach(t => {
      const d = new Date(t.date);
      if (d >= thirtyDaysAgo) {
        currentMonthExpense += t.amount;
      } else if (d >= sixtyDaysAgo && d < thirtyDaysAgo) {
        prevMonthExpense += t.amount;
      }
    });

    const expenseChange = prevMonthExpense === 0 ? 0 : ((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100;

    const categoryData = Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); 

    let observation = "Keep tracking your expenses to see more insights here.";
    if (expenseChange > 10) {
      observation = "Your spending has increased significantly compared to the last period. Consider reviewing your budget.";
    } else if (expenseChange < -10) {
      observation = "Great job! Your spending has decreased compared to the last period. You are saving more!";
    } else if (currentMonthExpense > 0) {
      observation = "Your spending is relatively stable compared to the last period.";
    }

    return {
      highestCategory,
      currentMonthExpense,
      prevMonthExpense,
      expenseChange,
      categoryData,
      observation
    };
  }, [transactions]);

  if (!mounted) return null;

  if (!insights) {
    return <div className="flex flex-col gap-8 p-8 text-center text-slate-500"><p>Not enough data for insights.</p></div>;
  }

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    borderRadius: '8px'
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="page-title m-0">Financial Insights</h1>
        <p className="page-subtitle m-0">Discover patterns and understand your spending habits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="surface-card flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Award className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0 mb-2">Top Spending Category</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white m-0 leading-tight">{insights.highestCategory[0]}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">${insights.highestCategory[1].toLocaleString()} total</p>
          </div>
        </div>

        <div className="surface-card flex items-start gap-4 p-6">
          <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center shrink-0">
            {insights.expenseChange > 0 ? (
              <TrendingUp className="text-rose-600 dark:text-rose-400" size={24} />
            ) : (
              <TrendingDown className="text-emerald-600 dark:text-emerald-400" size={24} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0 mb-2">Monthly Comparison</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white m-0 leading-tight">
              {Math.abs(insights.expenseChange).toFixed(1)}% {insights.expenseChange > 0 ? "Increase" : "Decrease"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">vs. previous 30 days</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm dark:border-amber-800 dark:from-amber-950 dark:to-orange-950 md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <AlertCircle className="text-amber-500 dark:text-amber-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0 mb-2">Observation</h3>
            <p className="text-base text-slate-900 dark:text-white leading-relaxed m-0">{insights.observation}</p>
          </div>
        </div>
      </div>

      <div className="surface-card flex flex-col p-6 lg:p-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0 mb-6">Top 5 Expense Categories</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tickLine={false} axisLine={false} />
              <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{ fill: theme === 'dark' ? '#334155' : '#f8fafc' }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: tooltipStyle.color }}
                formatter={(value: any) => `$${value}`}
              />
              <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
