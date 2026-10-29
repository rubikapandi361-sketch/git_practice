"use client";

import { useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Plus,
  Loader2,
  Save,
  X,
  PencilLine,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  CATEGORY_OPTIONS,
  TYPE_COLORS,
  formatCurrency,
  type Transaction,
  type TransactionType,
} from "./types";

const TABS: {
  value: TransactionType;
  label: string;
  icon: typeof TrendingUp;
}[] = [
  { value: "INCOME", label: "Income", icon: TrendingUp },
  { value: "EXPENSE", label: "Expense", icon: ShoppingCart },
  { value: "SAVINGS", label: "Deposit", icon: PiggyBank },
];

const localToday = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export interface TransactionPayload {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  editing: Transaction | null;
  onAdd: (data: TransactionPayload) => Promise<boolean>;
  onUpdate: (id: string, data: TransactionPayload) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function TransactionForm({
  editing,
  onAdd,
  onUpdate,
  onCancelEdit,
}: TransactionFormProps) {
  const { toast } = useToast();
  // State is initialized from `editing`; page.tsx remounts this form via `key`
  // whenever the edited transaction changes, so no prefill effect is needed.
  const [type, setType] = useState<TransactionType>(editing?.type ?? "INCOME");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [category, setCategory] = useState<string>(
    editing?.category ?? CATEGORY_OPTIONS.INCOME[0]
  );
  const [description, setDescription] = useState(editing?.description ?? "");
  const [date, setDate] = useState(
    editing ? editing.date.slice(0, 10) : localToday()
  );
  const [submitting, setSubmitting] = useState(false);

  const today = localToday();

  // Keep legacy/custom categories selectable if they are not in the preset list
  const categoryOptions =
    editing &&
    type === editing.type &&
    !CATEGORY_OPTIONS[type].includes(editing.category)
      ? [editing.category, ...CATEGORY_OPTIONS[type]]
      : CATEGORY_OPTIONS[type];

  const resetForm = () => {
    setType("INCOME");
    setCategory(CATEGORY_OPTIONS.INCOME[0]);
    setAmount("");
    setDescription("");
    setDate(today);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = Number(amount);
    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (type === "EXPENSE" && !description.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter the name of the item you spent on.",
        variant: "destructive",
      });
      return;
    }

    const payload: TransactionPayload = {
      type,
      amount: parsedAmount,
      category,
      description,
      date: date || today,
    };

    setSubmitting(true);
    let ok = false;
    if (editing) {
      ok = await onUpdate(editing.id, payload);
    } else {
      ok = await onAdd(payload);
    }
    setSubmitting(false);

    if (ok) {
      resetForm();
      toast({
        title: editing ? "Transaction updated" : "Transaction added",
        description: `${type === "INCOME" ? "Income" : type === "EXPENSE" ? "Expense" : "Deposit"} of ${formatCurrency(parsedAmount)} ${editing ? "saved" : "recorded"}.`,
      });
    } else {
      toast({
        title: "Something went wrong",
        description: editing
          ? "Could not update the transaction. Please try again."
          : "Could not save the transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const typeLabel =
    type === "INCOME" ? "Income source" : type === "EXPENSE" ? "Category" : "Deposit target";

  return (
    <Card
      className={`border-border/60 shadow-sm transition-shadow ${
        editing ? "ring-2 ring-blue-500/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {editing ? (
            <>
              <PencilLine className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Edit Transaction
            </>
          ) : (
            "Add Transaction"
          )}
        </CardTitle>
        <CardDescription>
          {editing
            ? "Update the details below and save your changes"
            : "Record income, itemized expenses or deposits to savings"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as TransactionType);
              setCategory(CATEGORY_OPTIONS[v as TransactionType][0]);
            }}
          >
            <TabsList className="grid w-full grid-cols-3">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <tab.icon
                    className="h-4 w-4"
                    style={{ color: TYPE_COLORS[tab.value] }}
                    aria-hidden="true"
                  />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">{typeLabel}</Label>
            <Select
              value={category}
              onValueChange={(v) => {
                // Radix Select fires onValueChange("") when the controlled value
                // changes while the dropdown is closed (items not yet mounted).
                // Ignore those spurious resets — only accept real selections.
                if (v) setCategory(v);
              }}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category">
                  {category || null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Item Name
              {type === "EXPENSE" ? (
                <span className="text-red-500" aria-hidden="true">
                  {" "}
                  *
                </span>
              ) : (
                <span className="text-muted-foreground"> (optional)</span>
              )}
            </Label>
            <Input
              id="description"
              type="text"
              placeholder={
                type === "EXPENSE"
                  ? "e.g. Wireless headphones"
                  : type === "INCOME"
                    ? "e.g. October salary"
                    : "e.g. Monthly savings transfer"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
              required={type === "EXPENSE"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {editing ? (
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                {submitting ? "Saving..." : "Update Transaction"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  resetForm();
                  onCancelEdit();
                }}
                disabled={submitting}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="submit" className="w-full gap-1.5" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {submitting
                ? "Saving..."
                : type === "INCOME"
                  ? "Add Income"
                  : type === "EXPENSE"
                    ? "Add Expense"
                    : "Add Deposit"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
