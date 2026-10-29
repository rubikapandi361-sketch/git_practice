"use client";

import { useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Trash2,
  Pencil,
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
  { label: string; icon: typeof TrendingUp; classes: string; amountClasses: string }
> = {
  INCOME: {
    label: "Income",
    icon: TrendingUp,
    classes: "bg-green-100 text-green-600",
    amountClasses: "text-green-600",
  },
  EXPENSE: {
    label: "Expense",
    icon: ShoppingCart,
    classes: "bg-red-100 text-red-600",
    amountClasses: "text-red-600",
  },
  SAVINGS: {
    label: "Deposit",
    icon: PiggyBank,
    classes: "bg-blue-100 text-blue-600",
    amountClasses: "text-blue-600",
  },
};

type Filter = "ALL" | TransactionType;

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  editing: Transaction | null;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function TransactionList({
  transactions,
  loading,
  editing,
  onEdit,
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
          <CardTitle className="text-base">Recent Transactions</CardTitle>
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
              const isEditing = editing?.id === t.id;
              return (
                <li
                  key={t.id}
                  className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isEditing
                      ? "border-blue-300 bg-blue-50/60"
                      : "border-border/50 bg-card hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.classes}`}
                    aria-hidden="true"
                  >
                    <meta.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span
                        className="truncate text-sm font-medium"
                        title={t.description || t.category}
                      >
                        {t.description || t.category}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${meta.classes}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.description ? `${t.category} · ` : ""}
                      {formatDate(t.date)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${meta.amountClasses}`}
                  >
                    {t.type === "INCOME" && "+"}
                    {t.type === "EXPENSE" && "−"}
                    {formatCurrency(t.amount)}
                  </span>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/50 hover:text-blue-600"
                      aria-label={`Edit ${t.description || t.category} transaction of ${formatCurrency(t.amount)}`}
                      onClick={() => onEdit(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground/50 hover:text-red-600"
                          aria-label={`Delete ${t.description || t.category} transaction of ${formatCurrency(t.amount)}`}
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
                          <AlertDialogTitle>
                            Delete transaction?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the{" "}
                            {meta.label.toLowerCase()} of{" "}
                            {formatCurrency(t.amount)} (
                            {t.description || t.category}) from your history.
                            Your balance and charts will update immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(t.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
