"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, PiggyBank, Plus, Loader2 } from "lucide-react";
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

interface TransactionFormProps {
  onAdd: (
    data: {
      type: TransactionType;
      amount: number;
      category: string;
      description: string;
      date: string;
    }
  ) => Promise<boolean>;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<TransactionType>("INCOME");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS.INCOME[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset category whenever the type tab changes
  useEffect(() => {
    setCategory(CATEGORY_OPTIONS[type][0]);
  }, [type]);

  const today = new Date().toISOString().slice(0, 10);

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

    setSubmitting(true);
    const ok = await onAdd({
      type,
      amount: parsedAmount,
      category,
      description,
      date: date || today,
    });
    setSubmitting(false);

    if (ok) {
      setAmount("");
      setDescription("");
      setDate("");
      toast({
        title: "Transaction added",
        description: `${type === "INCOME" ? "Income" : type === "EXPENSE" ? "Expense" : "Deposit"} of $${parsedAmount.toFixed(2)} recorded.`,
      });
    } else {
      toast({
        title: "Something went wrong",
        description: "Could not save the transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add Transaction</CardTitle>
        <CardDescription>
          Record credited income, product expenses or deposits to savings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as TransactionType)}
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
            <Label htmlFor="category">
              {type === "INCOME"
                ? "Income source"
                : type === "EXPENSE"
                  ? "Product / category"
                  : "Deposit target"}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS[type].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Note (optional)</Label>
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

          <Button
            type="submit"
            className="w-full gap-1.5"
            disabled={submitting}
          >
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
        </form>
      </CardContent>
    </Card>
  );
}
