export type TransactionType = "INCOME" | "EXPENSE" | "SAVINGS";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface Totals {
  totalIncome: number;
  totalSpent: number;
  totalSaved: number;
  balance: number;
  spentPercent: number;
  savedPercent: number;
  remainingPercent: number;
}

export const CATEGORY_OPTIONS: Record<TransactionType, string[]> = {
  INCOME: [
    "Salary",
    "Freelance",
    "Business",
    "Investment Return",
    "Gift",
    "Other Income",
  ],
  EXPENSE: [
    "Food",
    "Rent",
    "Bills",
    "Entertainment",
    "Shopping",
    "Groceries",
    "Transport",
    "Health",
    "Other",
  ],
  SAVINGS: [
    "Bank Deposit",
    "Fixed Deposit",
    "Emergency Fund",
    "Investment",
    "Other Savings",
  ],
};

// Category colors for the spending pie chart
export const CATEGORY_PALETTE = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#84cc16", // lime
];

// Color coding: green = income/balance, blue = savings/deposits, red = expenses
export const TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: "#22c55e", // green
  EXPENSE: "#ef4444", // red
  SAVINGS: "#3b82f6", // blue
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function computeTotals(transactions: Transaction[]): Totals {
  let totalIncome = 0;
  let totalSpent = 0;
  let totalSaved = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") totalIncome += t.amount;
    else if (t.type === "EXPENSE") totalSpent += t.amount;
    else if (t.type === "SAVINGS") totalSaved += t.amount;
  }

  const balance = totalIncome - totalSpent - totalSaved;
  const safeIncome = totalIncome > 0 ? totalIncome : 1;

  return {
    totalIncome,
    totalSpent,
    totalSaved,
    balance,
    spentPercent: totalIncome > 0 ? (totalSpent / safeIncome) * 100 : 0,
    savedPercent: totalIncome > 0 ? (totalSaved / safeIncome) * 100 : 0,
    remainingPercent: totalIncome > 0 ? (balance / safeIncome) * 100 : 0,
  };
}
