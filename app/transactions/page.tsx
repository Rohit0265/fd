"use client";

import { useState, useMemo } from "react";
import { useFinance, Transaction, TransactionType } from "../../lib/FinanceContext";
import { Search, Plus, Trash2, SlidersHorizontal, ArrowDown, ArrowUp, Download } from "lucide-react";
import clsx from "clsx";

export default function TransactionsPage() {
  const { transactions, role, addTransaction, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [sortOrder, setSortOrder] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", amount: "", category: "Food", type: "expense" as TransactionType, date: new Date().toISOString().split('T')[0] });

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const lowerReq = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(lowerReq) || t.category.toLowerCase().includes(lowerReq)
      );
    }

    if (filterType !== "all") {
      result = result.filter(t => t.type === filterType);
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
        default: return 0;
      }
    });

    return result;
  }, [transactions, searchTerm, filterType, sortOrder]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description || !newTx.amount) return;

    addTransaction({
      description: newTx.description,
      amount: parseFloat(newTx.amount),
      category: newTx.category,
      type: newTx.type,
      date: newTx.date
    });
    
    setIsAddModalOpen(false);
    setNewTx({ description: "", amount: "", category: "Food", type: "expense", date: new Date().toISOString().split('T')[0] });
  };

  const exportCSV = () => {
    if (filteredAndSorted.length === 0) return;
    const headers = ["Date", "Description", "Category", "Amount", "Type"];
    const rows = filteredAndSorted.map(tx => [
      tx.date, 
      `"${tx.description.replace(/"/g, '""')}"`, 
      `"${tx.category.replace(/"/g, '""')}"`, 
      tx.amount, 
      tx.type
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (filteredAndSorted.length === 0) return;
    const jsonContent = JSON.stringify(filteredAndSorted, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white m-0">Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-0 text-base">View and manage your financial activity.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-md font-medium transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50 h-full"
              disabled={filteredAndSorted.length === 0}
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-20 flex flex-col overflow-hidden">
                <button 
                  onClick={() => { exportCSV(); setIsExportMenuOpen(false); }} 
                  className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Download CSV
                </button>
                <button 
                  onClick={() => { exportJSON(); setIsExportMenuOpen(false); }} 
                  className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 text-left border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Download JSON
                </button>
              </div>
            )}
          </div>
          {role === "Admin" && (
            <button 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-md font-medium transition-colors"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by description or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pr-4 pl-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative flex items-center">
            <SlidersHorizontal size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-3 pr-8 pl-10 text-slate-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-3 px-4 md:pr-8 text-slate-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr>
                <th className="p-4 md:px-6 md:py-4 text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Date</th>
                <th className="p-4 md:px-6 md:py-4 text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Description</th>
                <th className="p-4 md:px-6 md:py-4 text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Category</th>
                <th className="p-4 md:px-6 md:py-4 text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Amount</th>
                {role === "Admin" && <th className="p-4 md:px-6 md:py-4 text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <td className="p-4 md:px-6 md:py-4 text-slate-900 dark:text-white text-sm whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 md:px-6 md:py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-7 h-7 rounded-full flex items-center justify-center shrink-0", 
                          tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                        )}>
                          {tx.type === 'income' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{tx.description}</span>
                      </div>
                    </td>
                    <td className="p-4 md:px-6 md:py-4">
                      <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium whitespace-nowrap">
                        {tx.category}
                      </span>
                    </td>
                    <td className={clsx("p-4 md:px-6 md:py-4 font-semibold text-sm whitespace-nowrap", 
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    {role === "Admin" && (
                      <td className="p-4 md:px-6 md:py-4 whitespace-nowrap">
                        <button 
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-md transition-colors"
                          onClick={() => deleteTransaction(tx.id)}
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === "Admin" ? 5 : 4} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-700 relative">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 mt-0">Add Transaction</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 dark:text-slate-400 text-sm">Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-slate-900 dark:text-white cursor-pointer select-none">
                    <input 
                      type="radio" 
                      className="accent-indigo-600"
                      checked={newTx.type === 'expense'} 
                      onChange={() => setNewTx({...newTx, type: 'expense'})} 
                    />
                    Expense
                  </label>
                  <label className="flex items-center gap-2 text-slate-900 dark:text-white cursor-pointer select-none">
                    <input 
                      type="radio" 
                      className="accent-indigo-600"
                      checked={newTx.type === 'income'} 
                      onChange={() => setNewTx({...newTx, type: 'income'})} 
                    />
                    Income
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 dark:text-slate-400 text-sm">Description</label>
                <input 
                  type="text" 
                  value={newTx.description} 
                  onChange={e => setNewTx({...newTx, description: e.target.value})}
                  required
                  placeholder="E.g., Groceries"
                  className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 dark:text-slate-400 text-sm">Amount ($)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={newTx.amount} 
                  onChange={e => setNewTx({...newTx, amount: e.target.value})}
                  required
                  placeholder="0.00"
                  className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 dark:text-slate-400 text-sm">Category</label>
                <input 
                  type="text" 
                  value={newTx.category} 
                  onChange={e => setNewTx({...newTx, category: e.target.value})}
                  required
                  placeholder="E.g., Utilities"
                  className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-600 dark:text-slate-400 text-sm">Date</label>
                <input 
                  type="date" 
                  value={newTx.date} 
                  onChange={e => setNewTx({...newTx, date: e.target.value})}
                  required
                  className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 rounded-md text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
