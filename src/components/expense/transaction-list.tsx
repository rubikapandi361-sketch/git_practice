"use client";

import { useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Trash2,
  Loader2,
  ReceiptText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  type Transaction,
  type TransactionType,
} from "./types";

const TYPE_META: Record<
  TransactionType,
  { label: string; icon: typeof TrendingUp; classes: string }
> = {
  INCOME: {
    label: "Income",
    icon: TrendingUp,
    classes: "bg-emerald-100 text-emerald-600",
  },
  EXPENSE: {
    label: "Expense",
    icon: ShoppingCart,
    classes: "bg-rose-100 text-rose-600",
  },
  SAVINGS: {
    label: "Deposit",
    icon: PiggyBank,
    classes: "bg-amber-100 text-amber-600",
  },
};

type Filter = "ALL" | TransactionType;

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
}

export function TransactionList({
  transactions,
  loading,
  onDelete,
}: TransactionListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered =
    filter === "ALL"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const counts: Record<Filter, number> = {
    ALL: transactions.length,
    INCOME: transactions.filter((t) => t.type === "INCOME").length,
    EXPENSE: transactions.filter((t) => t.type === "EXPENSE").length,
    SAVINGS: transactions.filter((t) => t.type === "SAVINGS").length,
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const ok = await onDelete(id);
    setDeletingId(null);
    if (ok) {
      toast({ title: "Transaction deleted" });
    } else {
      toast({
        title: "Delete failed",
        description: "Could not delete the transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div>
          <CardTitle className="text-base">Transaction History</CardTitle>
          <CardDescription>
            All your income, expenses and deposits · newest first
          </CardDescription>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
            <TabsTrigger value="INCOME">In ({counts.INCOME})</TabsTrigger>
            <TabsTrigger value="EXPENSE">Out ({counts.EXPENSE})</TabsTrigger>
            <TabsTrigger value="SAVINGS">Saved ({counts.SAVINGS})</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2
              className="h-6 w-6 animate-spin text-muted-foreground/50"
              aria-label="Loading transactions"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <ReceiptText
              className="h-8 w-8 text-muted-foreground/40"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-muted-foreground">
              {transactions.length === 0
                ? "No transactions yet"
                : "Nothing in this filter"}
            </p>
            <p className="max-w-[240px] text-xs text-muted-foreground">
              {transactions.length === 0
                ? "Use the form to add your first income, expense or deposit."
                : "Try another tab to see your other transactions."}
            </p>
          </div>
        ) : (
          <ul
            className="max-h-96 space-y-2 overflow-y-auto pr-1"
            aria-label="Transaction history list"
          >
            {filtered.map((t) => {
              const meta = TYPE_META[t.type];
              return (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.classes}`}
                    aria-hidden="true"
                  >
                    <meta.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="truncate text-sm font-medium">
                        {t.category}
                      </span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(t.date)}
                      {t.description ? ` · ${t.description}` : ""}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      t.type === "INCOME"
                        ? "text-emerald-600"
                        : t.type === "EXPENSE"
                          ? "text-rose-600"
                          : "text-amber-600"
                    }`}
                  >
                    {t.type === "INCOME" && "+"}
                    {t.type === "EXPENSE" && "−"}
                    {formatCurrency(t.amount)}
                  </span>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground/50 hover:text-rose-600"
                        aria-label={`Delete ${t.category} transaction of ${formatCurrency(t.amount)}`}
                      >
                        {deletingId === t.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the {meta.label.toLowerCase()}{" "}
                          of {formatCurrency(t.amount)} ({t.category}) from your
                          history. Your balance and charts will update
                          immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(t.id)}
                          className="bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
