export type UserRole = "viewer" | "admin";
export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  type: TransactionType;
  amount: number;
};

export const initialTransactions: Transaction[] = [
  { id: "txn-1", date: "2026-04-01", merchant: "Acme Corp Payroll", category: "Salary", type: "income", amount: 5200 },
  { id: "txn-2", date: "2026-04-02", merchant: "FreshCart", category: "Groceries", type: "expense", amount: 138.45 },
  { id: "txn-3", date: "2026-04-03", merchant: "Metro Energy", category: "Utilities", type: "expense", amount: 94.2 },
  { id: "txn-4", date: "2026-04-04", merchant: "Landmark Apartments", category: "Rent", type: "expense", amount: 1650 },
  { id: "txn-5", date: "2026-04-05", merchant: "Nimbus Studio", category: "Freelance", type: "income", amount: 860 },
  { id: "txn-6", date: "2026-04-06", merchant: "Skyline Cafe", category: "Dining", type: "expense", amount: 42.3 },
  { id: "txn-7", date: "2026-04-07", merchant: "RideNow", category: "Transport", type: "expense", amount: 27.8 },
  { id: "txn-8", date: "2026-04-08", merchant: "Prime Video", category: "Subscriptions", type: "expense", amount: 14.99 },
  { id: "txn-9", date: "2026-04-10", merchant: "WellSpring Clinic", category: "Health", type: "expense", amount: 78 },
  { id: "txn-10", date: "2026-04-11", merchant: "Harbor Investments", category: "Investments", type: "income", amount: 430 },
  { id: "txn-11", date: "2026-04-12", merchant: "ModeHaus", category: "Shopping", type: "expense", amount: 123.75 },
  { id: "txn-12", date: "2026-04-14", merchant: "CloudNine Telecom", category: "Utilities", type: "expense", amount: 61.5 }
];

export const monthlyBalanceTrend = [
  { month: "Nov", balance: 11200 },
  { month: "Dec", balance: 11840 },
  { month: "Jan", balance: 12120 },
  { month: "Feb", balance: 12760 },
  { month: "Mar", balance: 13250 },
  { month: "Apr", balance: 13690 }
];

export const previousMonthExpenseByCategory = {
  Rent: 1650,
  Groceries: 390,
  Utilities: 270,
  Dining: 180,
  Transport: 125,
  Shopping: 245
};
