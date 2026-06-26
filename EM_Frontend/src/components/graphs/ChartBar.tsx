"use client";

import { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  TooltipPayloadEntry,
  XAxis,
  YAxis,
} from "recharts";

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry: TooltipPayloadEntry) => (
          <div key={entry.dataKey as string} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">{entry.name}:</span>
            <span className="text-xs font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type BarConfig = {
  dataKey: string;
  name: string;
  colorStart: string;
  colorEnd: string;
  radius?: [number, number, number, number];
};

interface ChartBarProps<T = Record<string, unknown>> {
  title: string;
  description?: string;
  icon?: ReactNode;
  data: T[];
  xDataKey: string;
  bars: BarConfig[];
  barSize?: number;
  barCategoryGap?: string | number;
  height?: number;
  className?: string;
}

export function ChartBar<T extends Record<string, unknown>>({
  title,
  description,
  icon,
  data,
  xDataKey,
  bars,
  barSize = 24,
  barCategoryGap = "30%",
  height = 220,
  className = "",
}: ChartBarProps<T>) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barSize={barSize}
          barCategoryGap={barCategoryGap}
        >
          <defs>
            {bars.map((bar) => (
              <linearGradient
                key={bar.dataKey}
                id={`grad-bar-${bar.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={bar.colorStart} stopOpacity={1} />
                <stop offset="100%" stopColor={bar.colorEnd} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          <Tooltip content={CustomTooltip} />

          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={`url(#grad-bar-${bar.dataKey})`}
              radius={bar.radius ?? [6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
