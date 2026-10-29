"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Wallet } from "lucide-react";
import { SummaryCards } from "@/components/expense/summary-cards";
import { AllocationChart } from "@/components/expense/allocation-chart";
import { CategoryChart } from "@/components/expense/category-chart";
import {
  TransactionForm,
  type TransactionPayload,
} from "@/components/expense/transaction-form";
import { TransactionList } from "@/components/expense/transaction-list";
import { computeTotals, type Transaction } from "@/components/expense/types";
import {
  createId,
  getServerTransactionsSnapshot,
  getTransactionsSnapshot,
  mutateTransactions,
  subscribeTransactions,
} from "@/lib/transactions-store";

export default function Home() {
  // localStorage read through React's external-store bridge: the server
  // render and hydration pass use an empty snapshot, real data appears on
  // the first client render without effects or state cascades.
  const transactions = useSyncExternalStore(
    subscribeTransactions,
    getTransactionsSnapshot,
    getServerTransactionsSnapshot
  );

  const [editing, setEditing] = useState<Transaction | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => computeTotals(transactions), [transactions]);

  const handleAdd = useCallback(
    async (data: TransactionPayload): Promise<boolean> => {
      const created: Transaction = {
        id: createId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      return mutateTransactions((prev) => [created, ...prev]);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, data: TransactionPayload): Promise<boolean> => {
      const exists = getTransactionsSnapshot().some((t) => t.id === id);
      if (!exists) return false;
      const ok = mutateTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      if (ok) setEditing(null);
      return ok;
    },
    []
  );

  const handleEdit = useCallback((t: Transaction) => {
    setEditing(t);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      const exists = getTransactionsSnapshot().some((t) => t.id === id);
      if (!exists) return false;
      const ok = mutateTransactions((prev) => prev.filter((t) => t.id !== id));
      setEditing((prev) => (prev?.id === id ? null : prev));
      return ok;
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 to-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-white shadow-sm"
            aria-hidden="true"
          >
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Expense Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Track income, deposits, itemized expenses and your remaining
              balance · saved in your browser
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        <section aria-label="Balance summary">
          <SummaryCards totals={totals} />
        </section>

        <section
          aria-label="Charts"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <AllocationChart
            totalIncome={totals.totalIncome}
            totalSpent={totals.totalSpent}
            totalSaved={totals.totalSaved}
            balance={totals.balance}
            spentPercent={totals.spentPercent}
            savedPercent={totals.savedPercent}
            remainingPercent={totals.remainingPercent}
          />
          <CategoryChart transactions={transactions} />
        </section>

        <section
          aria-label="Add transaction and history"
          className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5"
        >
          <div ref={formRef} className="scroll-mt-4 lg:col-span-2">
            <TransactionForm
              key={editing?.id ?? "new"}
              editing={editing}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              editing={editing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Expense Tracker · Balance = Income − Expenses − Deposits · Data is
          stored locally in your browser
        </div>
      </footer>
    </div>
  );
}
