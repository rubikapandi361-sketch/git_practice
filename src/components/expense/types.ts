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
    "Groceries",
    "Electronics",
    "Food & Drinks",
    "Clothing",
    "Transport",
    "Rent & Bills",
    "Entertainment",
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

// Category colors for the spending pie chart (no blue/indigo)
export const CATEGORY_PALETTE = [
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange
  "#06b6d4", // cyan
  "#a855f7", // purple
];

export const TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: "#10b981", // emerald
  EXPENSE: "#f43f5e", // rose
  SAVINGS: "#f59e0b", // amber
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
