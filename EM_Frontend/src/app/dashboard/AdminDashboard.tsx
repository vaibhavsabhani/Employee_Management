"use client";

import { useGetAdminDashboardQuery } from "@/src/store/action/dashboard/dashboard";
import { StatCard } from "@/src/components/custom/StatCard";
import { LEAVE_COLORS, PALETTE } from "@/src/constant/constant";
import { ChartArea } from "@/src/components/graphs/ChartArea";
import { ChartBar } from "@/src/components/graphs/ChartBar";
import { ChartPie } from "@/src/components/graphs/ChartPie";
import { DashboardListCard } from "@/src/components/custom/DashboardListCard";
import { TrendingUp } from "lucide-react";
import { AdminDashboardConfig } from "./config/statCardConfig";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboardQuery();

  const { statCards, AreaChartConfig, PendingCardsConfig } =
    AdminDashboardConfig(data);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      <div>
        <h1 className="text-2xl font-black text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            sub={c.sub}
            color={c.color}
            gradient={c.gradient}
            navigateTo={c.navigateTo}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartArea
          title="Attendance Trend"
          description="Last 7 days"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
          className="xl:col-span-3"
          data={data?.attendanceTrend ?? []}
          xDataKey="date"
          areas={AreaChartConfig}
        />

        <ChartPie
          title="Leave Distribution"
          description="By leave type"
          data={data?.leaveDistribution ?? []}
          dataKey="count"
          nameKey="type"
          colors={LEAVE_COLORS}
          emptyMessage="No leave requests yet"
          className="xl:col-span-2"
          renderLegendValue={(d: {
            count: number;
            days: number;
            type: string;
          }) => `${d.count} req · ${d.days}d`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ChartBar
          title="Monthly Time Logged"
          description="Hours across all employees · last 6 months"
          data={data?.timeEntryTrend ?? []}
          xDataKey="month"
          bars={[
            {
              dataKey: "totalHours",
              name: "Total Hours",
              colorStart: PALETTE.violet,
              colorEnd: PALETTE.blue,
            },
          ]}
          className="xl:col-span-3"
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
