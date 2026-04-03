"use client";

import { useMemo, useState } from "react";
import {
  initialTransactions,
  monthlyBalanceTrend,
  previousMonthExpenseByCategory,
  type Transaction,
  type TransactionType,
  type UserRole
} from "@/lib/finance-data";

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
type ThemeMode = "light" | "dark";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const amountFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)"
];

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function buildLinePath(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
}

export function FinanceDashboard() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [role, setRole] = useState<UserRole>("admin");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date-desc");
  const [draft, setDraft] = useState({
    merchant: "",
    category: "",
    date: "2026-04-15",
    amount: "",
    type: "expense" as TransactionType
  });

  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((transaction) => transaction.category))).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        const matchesSearch =
          !query ||
          transaction.merchant.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query);
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;
        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "date-asc":
            return a.date.localeCompare(b.date);
          case "amount-desc":
            return b.amount - a.amount;
          case "amount-asc":
            return a.amount - b.amount;
          case "date-desc":
          default:
            return b.date.localeCompare(a.date);
        }
      });
  }, [categoryFilter, search, sortKey, transactions, typeFilter]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [transactions]);

  const spendingBreakdown = useMemo(() => {
    const grouped = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce<Record<string, number>>((accumulator, transaction) => {
        accumulator[transaction.category] = (accumulator[transaction.category] ?? 0) + transaction.amount;
        return accumulator;
      }, {});

    return Object.entries(grouped)
      .sort(([, left], [, right]) => right - left)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: categoryColors[index % categoryColors.length]
      }));
  }, [transactions]);

  const insights = useMemo(() => {
    const topCategory = spendingBreakdown[0];
    const previousMonthTotal = Object.values(previousMonthExpenseByCategory).reduce(
      (sum, amount) => sum + amount,
      0
    );
    const currentMonthExpenses = totals.expenses;
    const delta = currentMonthExpenses - previousMonthTotal;
    const deltaLabel =
      delta === 0
        ? "on par with last month"
        : delta > 0
          ? `${amountFormatter.format(delta)} higher than last month`
          : `${amountFormatter.format(Math.abs(delta))} lower than last month`;

    return [
      {
        title: "Top spending category",
        value: topCategory ? topCategory.category : "No expenses yet",
        detail: topCategory
          ? `${amountFormatter.format(topCategory.amount)} spent so far`
          : "Add transactions to surface spending patterns."
      },
      {
        title: "Monthly comparison",
        value: deltaLabel,
        detail: `Previous month expenses: ${amountFormatter.format(previousMonthTotal)}`
      },
      {
        title: "Cash flow signal",
        value: totals.income >= totals.expenses ? "Positive cash flow" : "Negative cash flow",
        detail: `Net balance this period: ${amountFormatter.format(totals.balance)}`
      }
    ];
  }, [spendingBreakdown, totals.balance, totals.expenses, totals.income]);

  const trendPath = useMemo(() => {
    return buildLinePath(
      monthlyBalanceTrend.map((point) => point.balance),
      100,
      44
    );
  }, []);

  const canManageTransactions = role === "admin";

  function handleAddTransaction() {
    if (!canManageTransactions) {
      return;
    }

    const amount = Number.parseFloat(draft.amount);

    if (!draft.merchant || !draft.category || !draft.date || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const nextTransaction: Transaction = {
      id: `txn-${crypto.randomUUID()}`,
      merchant: draft.merchant,
      category: draft.category,
      date: draft.date,
      amount,
      type: draft.type
    };

    setTransactions((current) => [nextTransaction, ...current]);
    setDraft({
      merchant: "",
      category: "",
      date: draft.date,
      amount: "",
      type: "expense"
    });
  }

  return (
    <main className="shell" data-theme={theme}>
      <section className="hero">
        <div>
          <p className="eyebrow">Personal finance control center</p>
          <h1>Financial Dashboard</h1>
          <p className="hero-copy">
            Track balances, scan transactions, compare monthly spending, and demo
            role-based actions in a single clean workspace.
          </p>
        </div>

        <div className="toolbar">
          <label className="field compact">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>

          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          title="Total Balance"
          value={currency.format(totals.balance)}
          detail="Updated from current mock transactions"
        />
        <SummaryCard
          title="Income"
          value={currency.format(totals.income)}
          detail="Includes salary, freelance, and investment returns"
          tone="positive"
        />
        <SummaryCard
          title="Expenses"
          value={currency.format(totals.expenses)}
          detail="All outgoing payments in the active dataset"
          tone="negative"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Time-based visualization</p>
              <h2>Balance Trend</h2>
            </div>
            <span className="badge">6 months</span>
          </div>

          <div className="chart-card">
            <svg viewBox="0 0 100 56" className="line-chart" aria-label="Balance trend chart">
              <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${trendPath} L 100,56 L 0,56 Z`} fill="url(#trendFill)" />
              <path d={trendPath} fill="none" stroke="var(--chart-2)" strokeWidth="2.5" />
            </svg>

            <div className="trend-labels">
              {monthlyBalanceTrend.map((point) => (
                <div key={point.month}>
                  <span>{point.month}</span>
                  <strong>{currency.format(point.balance)}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Categorical visualization</p>
              <h2>Spending Breakdown</h2>
            </div>
          </div>

          {spendingBreakdown.length > 0 ? (
            <div className="breakdown-list">
              {spendingBreakdown.map((item) => {
                const percentage = (item.amount / totals.expenses) * 100;

                return (
                  <div key={item.category} className="breakdown-row">
                    <div className="breakdown-meta">
                      <span className="dot" style={{ background: item.color }} />
                      <div>
                        <strong>{item.category}</strong>
                        <span>{amountFormatter.format(item.amount)}</span>
                      </div>
                    </div>
                    <div className="bar-wrap">
                      <div className="bar" style={{ width: `${percentage}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No expense data yet"
              description="Once expenses are added, category distribution will appear here."
            />
          )}
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel panel-large">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Transactions</p>
              <h2>Activity Feed</h2>
            </div>
            <span className="badge">{filteredTransactions.length} shown</span>
          </div>

          <div className="filters">
            <label className="field">
              <span>Search</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search merchant or category"
              />
            </label>

            <label className="field">
              <span>Type</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | TransactionType)}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="field">
              <span>Category</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Sort</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Amount high to low</option>
                <option value="amount-asc">Amount low to high</option>
              </select>
            </label>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th className="amount-column">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.merchant}</td>
                      <td>{transaction.category}</td>
                      <td>
                        <span className={`pill ${transaction.type}`}>{transaction.type}</span>
                      </td>
                      <td className={`amount-column ${transaction.type}`}>
                        {transaction.type === "expense" ? "-" : "+"}
                        {amountFormatter.format(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No transactions match these filters"
              description="Try clearing the search or category filters to bring data back."
            />
          )}
        </article>

        <article className="panel stack">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Role-based UI</p>
              <h2>{canManageTransactions ? "Admin controls" : "Viewer mode"}</h2>
            </div>
          </div>

          {canManageTransactions ? (
            <div className="admin-form">
              <label className="field">
                <span>Merchant</span>
                <input
                  type="text"
                  value={draft.merchant}
                  onChange={(event) => setDraft((current) => ({ ...current, merchant: event.target.value }))}
                  placeholder="Enter merchant name"
                />
              </label>

              <label className="field">
                <span>Category</span>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Enter category"
                />
              </label>

              <div className="form-row">
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                  />
                </label>

                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <label className="field">
                <span>Type</span>
                <select
                  value={draft.type}
                  onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as TransactionType }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <button type="button" className="primary-button" onClick={handleAddTransaction}>
                Add transaction
              </button>
            </div>
          ) : (
            <EmptyState
              title="Read-only access"
              description="Viewer role can explore summaries, charts, and transactions but cannot add or edit data."
            />
          )}

          <div className="insights">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Insights</p>
                <h2>Quick observations</h2>
              </div>
            </div>

            {insights.map((insight) => (
              <div key={insight.title} className="insight-card">
                <span>{insight.title}</span>
                <strong>{insight.value}</strong>
                <p>{insight.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  tone = "neutral"
}: {
  title: string;
  value: string;
  detail: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <article className={`summary-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
