"use client";

import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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

type AreaConfig = {
  dataKey: string;
  name: string;
  color: string;
};

interface ChartAreaProps<T = Record<string, unknown>> {
  title: string;
  description?: string;
  icon?: ReactNode;
  data: T[];
  areas: AreaConfig[];
  xDataKey: string;
  height?: number;
  className?: string;
}

export function ChartArea<T extends Record<string, unknown>>({
  title,
  description,
  icon,
  data,
  areas,
  xDataKey,
  height = 220,
  className = "",
}: ChartAreaProps<T>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 ${className}`}
    >
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
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={area.dataKey}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey={xDataKey}
            tick={{
              fontSize: 11,
              fill: "var(--muted-foreground)",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 11,
              fill: "var(--muted-foreground)",
            }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          <Tooltip content={CustomTooltip} />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />

          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`}
              dot={{
                r: 3,
                fill: area.color,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
