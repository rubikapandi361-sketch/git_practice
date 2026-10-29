"use client";

import {
  TrendingUp,
  ShoppingCart,
  PiggyBank,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, type Totals } from "./types";

interface SummaryCardsProps {
  totals: Totals;
}

export function SummaryCards({ totals }: SummaryCardsProps) {
  const isBalanceNegative = totals.balance < 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Income — prominent hero card */}
      <Card className="border-transparent bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 transition-shadow hover:shadow-lg hover:shadow-emerald-500/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug text-white/85">
                Total Income
              </p>
              <p className="mt-1.5 truncate text-3xl font-bold tracking-tight">
                {formatCurrency(totals.totalIncome)}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-white/75">
                Monthly salary or total budget
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20"
              aria-hidden="true"
            >
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Deposited / Savings — blue */}
      <SummaryStatCard
        label="Total Deposited / Savings"
        value={formatCurrency(totals.totalSaved)}
        hint={
          totals.totalIncome > 0
            ? `${totals.savedPercent.toFixed(1)}% savings rate`
            : "Money moved to savings"
        }
        icon={PiggyBank}
        iconClasses="bg-blue-100 text-blue-600"
        valueClasses="text-blue-600"
      />

      {/* Total Expenses — red */}
      <SummaryStatCard
        label="Total Expenses"
        value={formatCurrency(totals.totalSpent)}
        hint={
          totals.totalIncome > 0
            ? `${totals.spentPercent.toFixed(1)}% of income spent`
            : "Sum of all items spent"
        }
        icon={ShoppingCart}
        iconClasses="bg-red-100 text-red-600"
        valueClasses="text-red-600"
      />

      {/* Remaining Balance — green */}
      <SummaryStatCard
        label="Remaining Balance"
        value={formatCurrency(totals.balance)}
        hint={isBalanceNegative ? "Overdrawn — review spending" : "Income − expenses − deposits"}
        icon={isBalanceNegative ? AlertTriangle : Wallet}
        iconClasses={
          isBalanceNegative
            ? "bg-red-100 text-red-600"
            : "bg-green-100 text-green-600"
        }
        valueClasses={isBalanceNegative ? "text-red-600" : "text-green-600"}
      />
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClasses,
  valueClasses,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  iconClasses: string;
  valueClasses: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-muted-foreground">
              {label}
            </p>
            <p
              className={`mt-1.5 truncate text-2xl font-bold tracking-tight ${valueClasses}`}
            >
              {value}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
              {hint}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
