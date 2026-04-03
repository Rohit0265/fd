"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export type Role = "Viewer" | "Admin";
export type Theme = "light" | "dark";

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// mock data for the last 30 days
const generateMockData = (): Transaction[] => {
  const data: Transaction[] = [];
  const categories = {
    income: ["Salary", "Freelance", "Investments"],
    expense: ["Housing", "Food", "Transportation", "Utilities", "Entertainment"]
  };
  
  const now = new Date();
  
  for (let i = 0; i < 40; i++) {
    const isIncome = Math.random() > 0.7;
    const type = isIncome ? "income" : "expense";
    const amount = isIncome 
      ? Math.floor(Math.random() * 2000) + 500 
      : Math.floor(Math.random() * 200) + 10;
      
    const catList = categories[type];
    const category = catList[Math.floor(Math.random() * catList.length)];
    
    // Random date within the last 45 days
    const daysAgo = Math.floor(Math.random() * 45);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    data.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString().split('T')[0],
      amount,
      category,
      type,
      description: `${category} transaction`
    });
  }
  
  // Sort by date descending
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [role, setRole] = useState<Role>("Viewer");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize
  useEffect(() => {
    setTransactions(generateMockData());
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  // Sync theme
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme, mounted]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newTx = { ...t, id: `tx-${Math.random().toString(36).substr(2, 9)}` };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, "id">>) => {
    setTransactions((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  
  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        role,
        setRole,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
