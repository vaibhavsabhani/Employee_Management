"use client";

import { useGetAdminDashboardQuery } from "@/src/store/action/dashboard/dashboard";
import { useRouter } from "next/navigation";
import {
  Users, Clock, CalendarDays, CheckCircle2,
  XCircle, TrendingUp, UserCheck, AlertCircle,
  ArrowRight, Building2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ── colour palette ─────────────────────────── */
const PALETTE = {
  violet: "#7c3aed",
  green:  "#10b981",
  amber:  "#f59e0b",
  red:    "#ef4444",
  blue:   "#3b82f6",
  slate:  "#64748b",
};

const LEAVE_COLORS = [PALETTE.violet, PALETTE.blue, PALETTE.amber, PALETTE.green, PALETTE.red];

/* ── helpers ─────────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-popover border border-border shadow-xl px-4 py-3 text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ── stat card ───────────────────────────────── */
function StatCard({
  icon: Icon, label, value, sub, color, gradient,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/10`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {sub && <p className="mt-1 text-xs opacity-60 text-white">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
          <Icon className="size-5 text-white" />
        </div>
      </div>
      {/* decorative blob */}
      <div
        className="absolute -right-6 -bottom-6 size-24 rounded-full opacity-20"
        style={{ background: color }}
      />
    </div>
  );
}

/* ── empty state ─────────────────────────────── */
function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <AlertCircle className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ── skeleton ────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

/* ════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
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
    { label: "Total Employees",    value: s.totalEmployees ?? 0,       sub: `${s.activeEmployees ?? 0} active`,              icon: Users,       color: PALETTE.violet, gradient: "bg-linear-to-br from-violet-600 to-violet-800" },
    { label: "Today Present",      value: s.todayPresent ?? 0,         sub: `of ${s.activeEmployees ?? 0} employees`,         icon: UserCheck,   color: PALETTE.green,  gradient: "bg-linear-to-br from-emerald-500 to-emerald-700" },
    { label: "Today Absent",       value: s.todayAbsent ?? 0,          sub: `${s.todayNotMarked ?? 0} not marked`,            icon: XCircle,     color: PALETTE.red,    gradient: "bg-linear-to-br from-red-500 to-red-700" },
    { label: "On Leave Today",     value: s.todayOnLeave ?? 0,         sub: "approved leaves",                                icon: CalendarDays,color: PALETTE.amber,  gradient: "bg-linear-to-br from-amber-500 to-amber-700" },
    { label: "Pending Time Entries", value: s.pendingTimeEntries ?? 0, sub: "awaiting review",                               icon: Clock,       color: PALETTE.blue,   gradient: "bg-linear-to-br from-blue-500 to-blue-700" },
    { label: "Pending Leaves",     value: s.pendingLeaveRequests ?? 0, sub: "awaiting approval",                              icon: AlertCircle, color: PALETTE.amber,  gradient: "bg-linear-to-br from-orange-500 to-orange-700" },
    { label: "Approved Hrs (Month)", value: `${s.monthlyApprovedHours ?? 0}h`, sub: "this month",                            icon: CheckCircle2,color: PALETTE.green,  gradient: "bg-linear-to-br from-teal-500 to-teal-700" },
    { label: "Inactive Employees", value: (s.totalEmployees ?? 0) - (s.activeEmployees ?? 0), sub: "deactivated accounts",   icon: Building2,   color: PALETTE.slate,  gradient: "bg-linear-to-br from-slate-500 to-slate-700" },
  ];

  /* pie label */
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
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
      {/* greeting */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} icon={c.icon} label={c.label} value={c.value}
            sub={c.sub} color={c.color} gradient={c.gradient} />
        ))}
      </div>

      {/* row 2: attendance trend + leave distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* attendance area chart */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground">Attendance Trend</h2>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.attendanceTrend ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PALETTE.green}  stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PALETTE.green}  stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PALETTE.red}    stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PALETTE.red}    stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLeave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PALETTE.amber}  stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PALETTE.amber}  stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="present" name="Present" stroke={PALETTE.green} strokeWidth={2} fill="url(#gradPresent)" dot={{ r: 3, fill: PALETTE.green }} />
              <Area type="monotone" dataKey="absent"  name="Absent"  stroke={PALETTE.red}   strokeWidth={2} fill="url(#gradAbsent)"  dot={{ r: 3, fill: PALETTE.red }} />
              <Area type="monotone" dataKey="onLeave" name="On Leave" stroke={PALETTE.amber} strokeWidth={2} fill="url(#gradLeave)"  dot={{ r: 3, fill: PALETTE.amber }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* leave distribution pie */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="font-bold text-foreground">Leave Distribution</h2>
            <p className="text-xs text-muted-foreground">By leave type</p>
          </div>
          {(data?.leaveDistribution ?? []).length === 0 ? (
            <EmptyRow message="No leave requests yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data?.leaveDistribution ?? []} dataKey="count" nameKey="type"
                    cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderPieLabel}>
                    {(data?.leaveDistribution ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={LEAVE_COLORS[i % LEAVE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {(data?.leaveDistribution ?? []).map((d: any, i: number) => (
                  <div key={d.type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: LEAVE_COLORS[i % LEAVE_COLORS.length] }} />
                      <span className="text-muted-foreground">{d.type}</span>
                    </div>
                    <span className="font-semibold text-foreground">{d.count} req · {d.days}d</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* row 3: time entry trend + pending tables */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* monthly time entry bar chart */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground">Monthly Time Logged</h2>
              <p className="text-xs text-muted-foreground">Hours across all employees · last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.timeEntryTrend ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={24} barCategoryGap="30%">
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={PALETTE.violet} stopOpacity={1} />
                  <stop offset="100%" stopColor={PALETTE.blue}   stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalHours" name="Total Hours" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* pending panels */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* pending leaves */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground text-sm">Pending Leaves</h2>
              <button onClick={() => router.push("/leave")}
                className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            {(data?.recentPendingLeaves ?? []).length === 0 ? (
              <EmptyRow message="No pending leaves" />
            ) : (
              <div className="space-y-2.5">
                {(data?.recentPendingLeaves ?? []).map((l: any) => (
                  <div key={l.id} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{l.employeeName}</p>
                      <p className="text-[11px] text-muted-foreground">{l.leaveType} · {l.totalDays}d</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(l.startDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pending time entries */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground text-sm">Pending Time Entries</h2>
              <button onClick={() => router.push("/time-entry")}
                className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            {(data?.recentPendingTimeEntries ?? []).length === 0 ? (
              <EmptyRow message="No pending time entries" />
            ) : (
              <div className="space-y-2.5">
                {(data?.recentPendingTimeEntries ?? []).map((t: any) => (
                  <div key={t.id} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{t.employeeName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.startTime}–{t.endTime} · {Math.round(t.duration / 60 * 10) / 10}h
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(t.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
