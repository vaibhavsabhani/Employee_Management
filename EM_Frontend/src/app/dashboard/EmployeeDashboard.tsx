"use client";

import { useGetEmployeeDashboardQuery } from "@/src/store/action/dashboard/dashboard";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  TrendingUp,
  Plus,
} from "lucide-react";
import { StatCard } from "@/src/components/custom/StatCard";
import { ChartArea } from "@/src/components/graphs/ChartArea";
import { ChartBar } from "@/src/components/graphs/ChartBar";
import { ChartPie } from "@/src/components/graphs/ChartPie";
import { EmployeeDashboardConfig } from "./config/statCardConfig";
import { DashboardListCard } from "@/src/components/custom/DashboardListCard";
import { PALETTE } from "@/src/constant/constant";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export default function EmployeeDashboard() {
  const { data, isLoading } = useGetEmployeeDashboardQuery();
  const router = useRouter();

  const { PendingCardsConfig, statCards } = EmployeeDashboardConfig(data);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <Skeleton className="xl:col-span-3 h-72" />
          <Skeleton className="xl:col-span-2 h-72" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <Skeleton className="xl:col-span-3 h-72" />
          <Skeleton className="xl:col-span-2 h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/time-entry/add")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-violet-700 text-white text-sm font-semibold hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg shadow-violet-500/25 cursor-pointer"
          >
            <Plus className="size-4" /> Log Hours
          </button>
          <button
            type="button"
            onClick={() => router.push("/leave/add")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            <CalendarDays className="size-4" /> Apply Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            sub={c.sub}
            color={c.color}
            gradient={c.gradient}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartBar
          className="xl:col-span-3"
          title="Weekly Work Hours"
          description="Last 7 days"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
          data={data?.weeklyHours ?? []}
          xDataKey="day"
          barSize={28}
          barCategoryGap="30%"
          bars={[
            {
              dataKey: "hours",
              name: "Hours",
              colorStart: PALETTE.violet,
              colorEnd: PALETTE.blue,
              radius: [6, 6, 0, 0],
            },
          ]}
        />

        <ChartPie
          className="xl:col-span-2"
          title="Time Entry Status"
          description="All-time breakdown"
          data={data?.timeEntryStatus ?? []}
          dataKey="count"
          nameKey="status"
          height={160}
          emptyMessage="No time entries yet"
          colors={[PALETTE.amber, PALETTE.green, PALETTE.red]}
          renderLegendValue={(item: any) => item.count}
        />
      </div>

      {/* row 3: monthly hours area + recent entries */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartArea
          className="xl:col-span-3"
          title="Monthly Hours Trend"
          description="Last 6 months"
          data={data?.monthlyHours ?? []}
          xDataKey="month"
          areas={[
            {
              dataKey: "hours",
              name: "Hours",
              color: PALETTE.violet,
            },
          ]}
        />

        <div className="xl:col-span-2 flex flex-col gap-4">
          {PendingCardsConfig.map((c) => (
            <DashboardListCard
              key={c.title}
              title={c.title}
              emptyMessage={c.emptyMessage}
              items={c.items}
              onViewAll={c.onViewAll}
              renderItem={c.renderItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
