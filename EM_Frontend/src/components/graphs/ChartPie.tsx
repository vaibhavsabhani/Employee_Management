"use client";

import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
} from "recharts";

function PieTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: entry.payload?.fill ?? entry.color }}
        />
        <span className="text-xs text-muted-foreground">{entry.name}:</span>
        <span className="text-xs font-semibold text-foreground">{entry.value}</span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <AlertCircle className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

function renderPieLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelProps) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + r * Math.sin((-midAngle * Math.PI) / 180);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

interface ChartPieProps<T extends Record<string, unknown> = Record<string, unknown>> {
  title: string;
  description?: string;
  icon?: ReactNode;
  data: T[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  height?: number;
  className?: string;
  emptyMessage?: string;
  renderLegendValue?: (item: T) => ReactNode;
}

export function ChartPie<T extends Record<string, unknown>>({
  title,
  description,
  icon,
  data,
  dataKey,
  nameKey,
  colors,
  height = 180,
  className = "",
  emptyMessage = "No data available",
  renderLegendValue,
}: ChartPieProps<T>) {
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

      {data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={renderPieLabel}
              >
                {data.map((_: T, i: number) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={PieTooltip} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-1.5">
            {data.map((item: T, i: number) => (
              <div
                key={item[nameKey] as string}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  <span className="text-muted-foreground">{item[nameKey] as string}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {renderLegendValue ? renderLegendValue(item) : String(item[dataKey])}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
