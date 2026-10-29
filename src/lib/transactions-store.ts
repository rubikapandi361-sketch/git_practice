import type { Transaction, TransactionType } from "@/components/expense/types";

/**
 * LocalStorage-backed external store for transactions, designed for
 * React's `useSyncExternalStore` (hydration-safe, lint-compliant).
 *
 * - Data lives entirely in the browser (no server round-trips).
 * - On first client read, if the storage key is absent (first visit),
 *   demo data is seeded automatically.
 * - `getTransactionsSnapshot()` always returns a stable reference, while
 *   `mutateTransactions()` updates storage, the in-memory snapshot and
 *   notifies all subscribed components/tabs.
 */

export const STORAGE_KEY = "expense-tracker:transactions:v1";

const VALID_TYPES: TransactionType[] = ["INCOME", "EXPENSE", "SAVINGS"];
const EMPTY: Transaction[] = [];

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTransaction(raw: unknown): Transaction | null {
  if (!isRecord(raw)) return null;
  const { id, type, amount, category, description, date, createdAt } = raw;
  if (typeof id !== "string" || id.length === 0) return null;
  if (typeof type !== "string" || !VALID_TYPES.includes(type as TransactionType))
    return null;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)
    return null;
  if (typeof category !== "string" || category.length === 0) return null;
  if (typeof date !== "string" || Number.isNaN(new Date(date).getTime()))
    return null;

  return {
    id,
    type: type as TransactionType,
    amount,
    category,
    description: typeof description === "string" ? description : null,
    date,
    createdAt:
      typeof createdAt === "string" &&
      !Number.isNaN(new Date(createdAt).getTime())
        ? createdAt
        : date,
  };
}

/** Newest first: by transaction date, then creation time as tie-breaker. */
export function sortTransactions(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) => {
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/* ------------------------------------------------------------------ */
/* External store (for useSyncExternalStore)                           */
/* ------------------------------------------------------------------ */

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: Transaction[] = EMPTY;

function emit(): void {
  for (const listener of listeners) listener();
}

function readStorage(): Transaction[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null; // key absent → first visit
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseTransaction)
      .filter((t): t is Transaction => t !== null);
  } catch {
    // Corrupted JSON or unavailable storage — start from a clean slate.
    return [];
  }
}

function recomputeSnapshot(allowSeed: boolean): void {
  const stored = readStorage();
  if (stored === null) {
    if (allowSeed) {
      const seeded = sampleTransactions();
      snapshot = sortTransactions(seeded);
      saveTransactions(snapshot);
    } else {
      snapshot = EMPTY;
    }
    return;
  }
  snapshot = sortTransactions(stored);
}

/**
 * Reads persisted data on first client-side import so the first
 * post-hydration render already shows real data. Skipped during SSR.
 */
if (typeof window !== "undefined") {
  recomputeSnapshot(true);
  // Keep multiple open tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    recomputeSnapshot(false);
    emit();
  });
}

export function subscribeTransactions(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTransactionsSnapshot(): Transaction[] {
  return snapshot;
}

export function getServerTransactionsSnapshot(): Transaction[] {
  return EMPTY;
}

/**
 * Applies `updater` to the current snapshot, persists the sorted result to
 * localStorage and notifies subscribers. Returns whether persistence worked.
 */
export function mutateTransactions(
  updater: (prev: Transaction[]) => Transaction[]
): boolean {
  const next = sortTransactions(updater(snapshot));
  snapshot = next;
  const ok = saveTransactions(next);
  emit();
  return ok;
}

/* ------------------------------------------------------------------ */
/* Persistence primitives                                              */
/* ------------------------------------------------------------------ */

export function saveTransactions(transactions: Transaction[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* First-visit demo data (mirrors the original database seed script)   */
/* ------------------------------------------------------------------ */

function sampleTransactions(): Transaction[] {
  const now = new Date();
  const at = (dayOfMonth: number) =>
    new Date(
      now.getFullYear(),
      now.getMonth(),
      dayOfMonth,
      12,
      0,
      0
    ).toISOString();
  // Keep some samples in a recent past month so the demo works early in a month.
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
    12,
    0,
    0
  );
  const inLastMonth = (dayOfMonth: number) =>
    new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth(),
      dayOfMonth,
      12,
      0,
      0
    ).toISOString();

  const seed: Array<
    Omit<Transaction, "id" | "date" | "createdAt"> & { day: number }
  > = [
    { type: "INCOME", amount: 3200, category: "Salary", description: "Monthly salary", day: 1 },
    { type: "SAVINGS", amount: 500, category: "Bank Deposit", description: "Monthly savings transfer", day: 2 },
    { type: "EXPENSE", amount: 900, category: "Rent", description: "Monthly house rent", day: 3 },
    { type: "EXPENSE", amount: 180.5, category: "Food", description: "Weekly groceries", day: 5 },
    { type: "EXPENSE", amount: 120, category: "Bills", description: "Electricity & internet", day: 7 },
    { type: "EXPENSE", amount: 129.99, category: "Shopping", description: "Wireless headphones", day: 8 },
    { type: "INCOME", amount: 450, category: "Freelance", description: "Design project", day: 12 },
    { type: "EXPENSE", amount: 45, category: "Transport", description: "Metro card top-up", day: 11 },
    { type: "SAVINGS", amount: 200, category: "Emergency Fund", description: "Top-up", day: 15 },
    { type: "EXPENSE", amount: 89.9, category: "Shopping", description: "Running shoes", day: 16 },
    { type: "EXPENSE", amount: 30, category: "Entertainment", description: "Movie night", day: 18 },
  ];

  const today = now.getDate();
  return seed.map(({ day, ...item }) => {
    // Days beyond today fall back to the previous month so dates never sit in the future.
    const iso = day <= today ? at(day) : inLastMonth(day);
    return { id: createId(), ...item, date: iso, createdAt: iso };
  });
}
