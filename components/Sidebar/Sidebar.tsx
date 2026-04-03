"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, Sun, Moon, Shield, User } from "lucide-react";
import { useFinance } from "../../lib/FinanceContext";
import clsx from "clsx";
import React, { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, theme, toggleTheme } = useFinance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleToggle = () => {
    setRole(role === "Viewer" ? "Admin" : "Viewer");
  };

  const navLinks = [
    { name: "Overview", href: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Transactions", href: "/transactions", icon: <ReceiptText size={20} /> },
    { name: "Insights", href: "/insights", icon: <BarChart3 size={20} /> },
  ];

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
              Financial Dashboard
            </h1>
            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
              Track balances, transactions, and insights in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              title={`Role: ${role}`}
            >
              {role === "Admin" ? <Shield size={16} /> : <User size={16} />}
              <span>{role}</span>
            </button>
          </div>
        </div>

      <nav className="flex flex-wrap gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      </div>
    </header>
  );
}
