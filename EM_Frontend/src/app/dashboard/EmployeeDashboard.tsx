"use client";

import { useGetEmployeeDashboardQuery } from "@/src/store/action/dashboard/dashboard";
import { useRouter } from "next/navigation";
import {
  Clock, CheckCircle2, AlertCircle, CalendarDays,
  TrendingUp, ArrowRight, Plus, FileText,
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { STATUS_MAP } from "@/src/constant/constant";

/* ── palette ──────────────────────────────── */
const PALETTE = {
  violet: "#7c3aed",
  green:  "#10b981",
  amber:  "#f59e0b",
  red:    "#ef4444",
  blue:   "#3b82f6",
  slate:  "#64748b",
};

const STATUS_PIE_COLORS: Record<string, string> = {
  Pending:  PALETTE.amber,
  Approved: PALETTE.green,
  Rejected: PALETTE.red,
};

const LEAVE_COLORS = [PALETTE.violet, PALETTE.blue, PALETTE.amber, PALETTE.green];

/* ── helpers ─────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-popover border border-border shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── stat card ───────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, gradient,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 text-white">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {sub && <p className="mt-1 text-xs opacity-60 text-white">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
          <Icon className="size-5 text-white" />
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 size-24 rounded-full opacity-20 bg-white" />
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <AlertCircle className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

/* ════════════════════════════════════════════════
   EMPLOYEE DASHBOARD
   ════════════════════════════════════════════════ */
export default function EmployeeDashboard() {
  const { data, isLoading } = useGetEmployeeDashboardQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
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

  const s = data?.stats ?? {};

  const statCards = [
    {
      label: "Hours This Month", value: `${s.totalHoursThisMonth ?? 0}h`,
      sub: `${s.totalEntriesThisMonth ?? 0} entries logged`,
      icon: Clock, gradient: "bg-linear-to-br from-violet-600 to-violet-800",
    },
    {
      label: "Approved Hours", value: `${s.approvedHours ?? 0}h`,
      sub: "confirmed this month",
      icon: CheckCircle2, gradient: "bg-linear-to-br from-emerald-500 to-emerald-700",
    },
    {
      label: "Pending Hours", value: `${s.pendingHours ?? 0}h`,
      sub: "awaiting admin review",
      icon: AlertCircle, gradient: "bg-linear-to-br from-amber-500 to-amber-700",
    },
    {
      label: "Approved Leaves", value: s.approvedLeaves ?? 0,
      sub: "this year",
      icon: CalendarDays, gradient: "bg-linear-to-br from-blue-500 to-blue-700",
    },
    {
      label: "Pending Leaves", value: s.pendingLeaves ?? 0,
      sub: "awaiting approval",
      icon: AlertCircle, gradient: "bg-linear-to-br from-orange-500 to-orange-700",
    },
    {
      label: "Rejected Leaves", value: s.rejectedLeaves ?? 0,
      sub: "this year",
      icon: TrendingUp, gradient: "bg-linear-to-br from-red-500 to-red-700",
    },
  ];

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + r * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
    );
  };

  return (
    <div className="space-y-6">
      {/* greeting + quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value}
            sub={c.sub} gradient={c.gradient} />
        ))}
      </div>

      {/* row 2: weekly hours bar + entry status donut */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* weekly hours */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground">Weekly Work Hours</h2>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.weeklyHours ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={28} barCategoryGap="30%">
              <defs>
                <linearGradient id="gradWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={PALETTE.violet} stopOpacity={1} />
                  <stop offset="100%" stopColor={PALETTE.blue}   stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" name="Hours" fill="url(#gradWeekly)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* time entry status donut */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="font-bold text-foreground">Time Entry Status</h2>
            <p className="text-xs text-muted-foreground">All-time breakdown</p>
          </div>
          {(data?.timeEntryStatus ?? []).every((s: any) => s.count === 0) ? (
            <EmptyRow message="No time entries yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data?.timeEntryStatus ?? []} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    paddingAngle={3} label={renderPieLabel} labelLine={false}>
                    {(data?.timeEntryStatus ?? []).map((entry: any) => (
                      <Cell key={entry.status} fill={STATUS_PIE_COLORS[entry.status] ?? PALETTE.slate} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {(data?.timeEntryStatus ?? []).map((d: any) => (
                  <div key={d.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: STATUS_PIE_COLORS[d.status] ?? PALETTE.slate }} />
                      <span className="text-muted-foreground">{d.status}</span>
                    </div>
                    <span className="font-semibold text-foreground">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* row 3: monthly hours area + recent entries */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* monthly hours area chart */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground">Monthly Hours Trend</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.monthlyHours ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PALETTE.violet} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={PALETTE.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="hours" name="Hours" stroke={PALETTE.violet} strokeWidth={2.5}
                fill="url(#gradMonthly)" dot={{ r: 4, fill: PALETTE.violet, strokeWidth: 2, stroke: "var(--background)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* right column: leave type + recent entries */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* leave by type */}
          {(data?.leavesByType ?? []).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground text-sm">Leaves by Type</h2>
                <button onClick={() => router.push("/leave")}
                  className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  View all <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="space-y-2">
                {(data?.leavesByType ?? []).map((d: any, i: number) => (
                  <div key={d.type} className="flex items-center gap-3">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: LEAVE_COLORS[i % LEAVE_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground truncate">{d.type}</span>
                        <span className="font-semibold text-foreground">{d.days}d</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (d.days / 30) * 100)}%`, background: LEAVE_COLORS[i % LEAVE_COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* recent time entries */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground text-sm">Recent Entries</h2>
              <button onClick={() => router.push("/time-entry")}
                className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            {(data?.recentTimeEntries ?? []).length === 0 ? (
              <EmptyRow message="No time entries yet" />
            ) : (
              <div className="space-y-2.5">
                {(data?.recentTimeEntries ?? []).map((t: any) => {
                  const s = STATUS_MAP[t.statusId as keyof typeof STATUS_MAP] ?? { label: "Unknown", className: "bg-badge-neutral text-badge-neutral-fg" };
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                      <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <FileText className="size-3.5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {t.startTime}–{t.endTime}
                          <span className="text-muted-foreground font-normal ml-1.5">
                            · {Math.round(t.duration / 60 * 10) / 10}h
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">{fmtDate(t.date)}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.className}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
