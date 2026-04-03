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
    <aside className="fixed bottom-0 md:top-0 left-0 w-full h-[70px] md:w-[260px] md:h-screen bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-row md:flex-col px-4 md:px-4 md:py-6 z-10 shadow-md md:shadow-none transition-all duration-300">
      <div className="hidden md:flex items-center gap-3 px-4 pb-8 text-slate-900 dark:text-white">
        <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
          $
        </div>
        <h2 className="text-xl font-semibold m-0 tracking-tight">FinDash</h2>
      </div>

      <nav className="flex flex-row md:flex-col gap-1 md:gap-2 flex-1 justify-start items-center md:items-stretch w-full md:w-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={clsx(
                "flex items-center justify-center md:justify-start gap-3 p-2 md:py-3 md:px-4 rounded-md font-medium transition-all duration-200 flex-1 md:flex-none text-[0.95rem]",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.icon}
              <span className="hidden md:inline">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex md:mt-auto pt-0 md:pt-6 border-l md:border-l-0 md:border-t border-slate-200 dark:border-slate-700 items-center md:items-stretch ml-auto pl-2 md:pl-0 md:ml-0">
        <div className="flex flex-row md:flex-col gap-1 md:gap-2">
           <button 
             onClick={handleRoleToggle} 
             className="flex items-center justify-center md:justify-start p-2 gap-3 md:py-3 md:px-4 rounded-md text-slate-600 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white w-full text-left text-[0.95rem]" 
             title={`Role: ${role}`}
           >
             {role === "Admin" ? <Shield size={18} /> : <User size={18} />}
             <span className="hidden md:inline">{role}</span>
           </button>
           
           <button 
             onClick={toggleTheme} 
             className="flex items-center justify-center md:justify-start p-2 gap-3 md:py-3 md:px-4 rounded-md text-slate-600 dark:text-slate-300 font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white w-full text-left text-[0.95rem]" 
             title="Toggle Theme"
           >
             {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
             <span className="hidden md:inline">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
           </button>
        </div>
      </div>
    </aside>
  );
}
