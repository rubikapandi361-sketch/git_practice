"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency, CATEGORY_PALETTE, type Transaction } from "./types";

interface CategoryChartProps {
  transactions: Transaction[];
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "EXPENSE") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return entries.map(([category, value], i) => ({
      key: category,
      value,
      fill: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }));
  }, [transactions]);

  const totalSpent = expenseByCategory.reduce((sum, c) => sum + c.value, 0);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of expenseByCategory) {
      config[item.key] = { label: item.key };
    }
    return config;
  }, [expenseByCategory]);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expenses by Category</CardTitle>
        <CardDescription>
          Amount spent per category · total {formatCurrency(totalSpent)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenseByCategory.length > 0 ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-[200px] w-[200px] shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={55}
                  outerRadius={90}
                  strokeWidth={2}
                >
                  {expenseByCategory.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul
              className="max-h-[200px] w-full space-y-2.5 overflow-y-auto pr-1"
              aria-label="Spending by category breakdown"
            >
              {expenseByCategory.map((item) => {
                const percent = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
                return (
                  <li key={item.key} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {item.key}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {percent.toFixed(1)}% of spending
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No expenses yet
            </p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Record the products you buy to see a category breakdown of your
              spending.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
