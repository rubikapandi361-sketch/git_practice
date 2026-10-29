"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { SummaryCards } from "@/components/expense/summary-cards";
import { AllocationChart } from "@/components/expense/allocation-chart";
import { CategoryChart } from "@/components/expense/category-chart";
import { TransactionForm } from "@/components/expense/transaction-form";
import { TransactionList } from "@/components/expense/transaction-list";
import {
  computeTotals,
  type Transaction,
  type TransactionType,
} from "@/components/expense/types";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setTransactions(
        (data.transactions ?? []).map(
          (
            t: Omit<Transaction, "type"> & { type: string }
          ): Transaction => ({
            ...t,
            type: t.type as TransactionType,
          })
        )
      );
    } catch {
      setError("Could not load your transactions. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => computeTotals(transactions), [transactions]);

  const handleAdd = useCallback(
    async (data: {
      type: TransactionType;
      amount: number;
      category: string;
      description: string;
      date: string;
    }): Promise<boolean> => {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) return false;
        await load();
        return true;
      } catch {
        return false;
      }
    },
    [load]
  );

  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) return false;
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 to-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm"
            aria-hidden="true"
          >
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Expense Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Track credited income, deposits, product spending and your balance
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <section aria-label="Balance summary">
          <SummaryCards totals={totals} loading={loading} />
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
          <div className="lg:col-span-2">
            <TransactionForm onAdd={handleAdd} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              loading={loading}
              onDelete={handleDelete}
            />
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Expense Tracker · Income − Spent − Deposits = Balance
        </div>
      </footer>
    </div>
  );
}
