"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "./types";

const ALLOCATION_COLORS = {
  spent: "#f43f5e",
  saved: "#f59e0b",
  remaining: "#14b8a6",
};

const chartConfig = {
  spent: { label: "Spent on products" },
  saved: { label: "Deposited / Saved" },
  remaining: { label: "Available balance" },
} satisfies ChartConfig;

interface AllocationChartProps {
  totalIncome: number;
  totalSpent: number;
  totalSaved: number;
  balance: number;
  spentPercent: number;
  savedPercent: number;
  remainingPercent: number;
}

export function AllocationChart({
  totalIncome,
  totalSpent,
  totalSaved,
  balance,
  spentPercent,
  savedPercent,
  remainingPercent,
}: AllocationChartProps) {
  const hasIncome = totalIncome > 0;

  const data = [
    { key: "spent", value: totalSpent, percent: spentPercent },
    { key: "saved", value: totalSaved, percent: savedPercent },
    { key: "remaining", value: balance, percent: remainingPercent },
  ].filter((d) => d.value > 0);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Where Your Income Goes</CardTitle>
        <CardDescription>
          How your credited income is split between products, deposits and balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasIncome && data.length > 0 ? (
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
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]
                              ?.label ?? name}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={55}
                  outerRadius={90}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        ALLOCATION_COLORS[
                          entry.key as keyof typeof ALLOCATION_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="w-full space-y-3" aria-label="Income allocation breakdown">
              {[
                {
                  label: "Spent on products",
                  value: totalSpent,
                  percent: spentPercent,
                  color: ALLOCATION_COLORS.spent,
                },
                {
                  label: "Deposited / Saved",
                  value: totalSaved,
                  percent: savedPercent,
                  color: ALLOCATION_COLORS.saved,
                },
                {
                  label: "Available balance",
                  value: balance,
                  percent: remainingPercent,
                  color: ALLOCATION_COLORS.remaining,
                },
              ]
                .filter((item) => item.value !== 0)
                .map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, item.percent))}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                          {item.percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No income recorded yet
            </p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Add your credited income below to see how it splits between
              products, deposits and balance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
