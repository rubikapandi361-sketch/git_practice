"use client";

import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Wallet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type Totals } from "./types";

interface SummaryCardsProps {
  totals: Totals;
  loading: boolean;
}

export function SummaryCards({ totals, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground/40"
                  aria-hidden="true"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isBalanceNegative = totals.balance < 0;

  const cards = [
    {
      label: "Credited Income",
      value: formatCurrency(totals.totalIncome),
      hint: "Total money received",
      icon: TrendingUp,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Spent on Products",
      value: formatCurrency(totals.totalSpent),
      hint:
        totals.totalIncome > 0
          ? `${totals.spentPercent.toFixed(1)}% of income used`
          : "Total expenses",
      icon: ShoppingCart,
      iconBg: "bg-rose-100 text-rose-600",
    },
    {
      label: "Deposited / Saved",
      value: formatCurrency(totals.totalSaved),
      hint:
        totals.totalIncome > 0
          ? `${totals.savedPercent.toFixed(1)}% savings rate`
          : "Total deposits",
      icon: PiggyBank,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Available Balance",
      value: formatCurrency(totals.balance),
      hint: isBalanceNegative
        ? "Overdrawn — review your spending"
        : "Income − spent − deposits",
      icon: isBalanceNegative ? AlertTriangle : Wallet,
      iconBg: isBalanceNegative
        ? "bg-rose-100 text-rose-600"
        : "bg-teal-100 text-teal-600",
      valueClass: isBalanceNegative ? "text-rose-600" : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="border-border/60 shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <p
                  className={`mt-1.5 truncate text-2xl font-bold tracking-tight ${
                    card.valueClass ?? "text-foreground"
                  }`}
                >
                  {card.value}
                </p>
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  {card.hint}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                aria-hidden="true"
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
