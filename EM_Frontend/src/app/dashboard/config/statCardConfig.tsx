import { LEAVE_COLORS, PALETTE, STATUS_MAP } from "@/src/constant/constant";
import { fmtDate } from "@/src/lib/utils";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

const statCardConfig = (s: any) => {
  return [
    {
      label: "Total Employees",
      value: s.totalEmployees ?? 0,
      sub: `${s.activeEmployees ?? 0} active`,
      icon: Users,
      color: PALETTE.violet,
      gradient: "bg-linear-to-br from-violet-600 to-violet-800",
    },
    {
      label: "Today Present",
      value: s.todayPresent ?? 0,
      sub: `of ${s.activeEmployees ?? 0} employees`,
      icon: UserCheck,
      color: PALETTE.green,
      gradient: "bg-linear-to-br from-emerald-500 to-emerald-700",
    },
    {
      label: "Today Absent",
      value: s.todayAbsent ?? 0,
      sub: `${s.todayNotMarked ?? 0} not marked`,
      icon: XCircle,
      color: PALETTE.red,
      gradient: "bg-linear-to-br from-red-500 to-red-700",
    },
    {
      label: "On Leave Today",
      value: s.todayOnLeave ?? 0,
      sub: "approved leaves",
      icon: CalendarDays,
      color: PALETTE.amber,
      gradient: "bg-linear-to-br from-amber-500 to-amber-700",
    },
    {
      label: "Pending Time Entries",
      value: s.pendingTimeEntries ?? 0,
      sub: "awaiting review",
      icon: Clock,
      color: PALETTE.blue,
      gradient: "bg-linear-to-br from-blue-500 to-blue-700",
    },
    {
      label: "Pending Leaves",
      value: s.pendingLeaveRequests ?? 0,
      sub: "awaiting approval",
      icon: AlertCircle,
      color: PALETTE.amber,
      gradient: "bg-linear-to-br from-orange-500 to-orange-700",
    },
    {
      label: "Approved Hrs (Month)",
      value: `${s.monthlyApprovedHours ?? 0}h`,
      sub: "this month",
      icon: CheckCircle2,
      color: PALETTE.green,
      gradient: "bg-linear-to-br from-teal-500 to-teal-700",
    },
    {
      label: "Inactive Employees",
      value: (s.totalEmployees ?? 0) - (s.activeEmployees ?? 0),
      sub: "deactivated accounts",
      icon: Building2,
      color: PALETTE.slate,
      gradient: "bg-linear-to-br from-slate-500 to-slate-700",
    },
  ];
};

const AreaChartConfig = [
  {
    dataKey: "present",
    name: "Present",
    color: PALETTE.green,
  },
  {
    dataKey: "absent",
    name: "Absent",
    color: PALETTE.red,
  },
  {
    dataKey: "onLeave",
    name: "On Leave",
    color: PALETTE.amber,
  },
];

const PendingCardsConfig = (data: any) => [
  {
    title: "Pending Leaves",
    emptyMessage: "No pending leaves",
    items: data?.recentPendingLeaves ?? [],
    onViewAll: () => {
      window.location.href = "/leave";
    },
    renderItem: (item: any) => (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-lg border border-border p-3"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            {item.employeeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.leaveType} · {item.totalDays}d
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Pending Time Entries",
    emptyMessage: "No pending time entries",
    items: data?.recentPendingTimeEntries ?? [],
    onViewAll: () => {
      window.location.href = "time-entry";
    },
    renderItem: (item: any) => (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-lg border border-border p-3"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            {item.employeeName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {item.startTime}–{item.endTime} ·{" "}
            {Math.round((item.duration / 60) * 10) / 10}h
          </p>
        </div>
      </div>
    ),
  },
];

export const AdminDashboardConfig = (data: any) => ({
  statCards: statCardConfig(data?.stats ?? {}),
  AreaChartConfig,
  PendingCardsConfig: PendingCardsConfig(data),
});

const dashboardCards = (data: any) => [
  {
    key: "recentEntries",
    title: "Recent Entries",
    emptyMessage: "No time entries yet",
    items: data?.recentTimeEntries ?? [],
    onViewAll: () => {
      window.location.href = "/time-entry";
    },
    renderItem: (t: any) => {
      const status = STATUS_MAP[t.statusId as keyof typeof STATUS_MAP] ?? {
        label: "Unknown",
        className: "bg-badge-neutral text-badge-neutral-fg",
      };

      return (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl bg-muted/40 p-2.5 transition-colors hover:bg-muted/70"
        >
          <div className="rounded-lg bg-violet-100 p-1.5 dark:bg-violet-900/30">
            <FileText className="size-3.5 text-violet-600 dark:text-violet-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">
              {t.startTime}–{t.endTime}
              <span className="ml-1.5 font-normal text-muted-foreground">
                · {Math.round((t.duration / 60) * 10) / 10}h
              </span>
            </p>

            <p className="text-[11px] text-muted-foreground">
              {fmtDate(t.date)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      );
    },
  },

  {
    key: "recentLeaves",
    title: "Leaves by Type",
    emptyMessage: "No leaves yet",
    items: data?.leavesByType ?? [],
    onViewAll: () => {
      window.location.href = "/leave";
    },
    renderItem: (d: any, index: number) => (
      <div key={d.type} className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{
            background: LEAVE_COLORS[index % LEAVE_COLORS.length],
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate text-muted-foreground">{d.type}</span>

            <span className="font-semibold text-foreground">{d.days}d</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (d.days / 30) * 100)}%`,
                background: LEAVE_COLORS[index % LEAVE_COLORS.length],
              }}
            />
          </div>
        </div>
      </div>
    ),
  },
];

const employeeStatCards = (s: any) => [
  {
    label: "Hours This Month",
    value: `${s.totalHoursThisMonth ?? 0}h`,
    sub: `${s.totalEntriesThisMonth ?? 0} entries logged`,
    icon: Clock,
    color: PALETTE.violet,
    gradient: "bg-linear-to-br from-violet-600 to-violet-800",
  },
  {
    label: "Approved Hours",
    value: `${s.approvedHours ?? 0}h`,
    sub: "confirmed this month",
    icon: CheckCircle2,
    color: PALETTE.green,
    gradient: "bg-linear-to-br from-emerald-500 to-emerald-700",
  },
  {
    label: "Pending Hours",
    value: `${s.pendingHours ?? 0}h`,
    sub: "awaiting admin review",
    icon: AlertCircle,
    color: PALETTE.red,
    gradient: "bg-linear-to-br from-amber-500 to-amber-700",
  },
  {
    label: "Approved Leaves",
    value: s.approvedLeaves ?? 0,
    sub: "this year",
    icon: CalendarDays,
    color: PALETTE.amber,
    gradient: "bg-linear-to-br from-blue-500 to-blue-700",
  },
  {
    label: "Pending Leaves",
    value: s.pendingLeaves ?? 0,
    sub: "awaiting approval",
    icon: AlertCircle,
    color: PALETTE.blue,
    gradient: "bg-linear-to-br from-orange-500 to-orange-700",
  },
  {
    label: "Rejected Leaves",
    value: s.rejectedLeaves ?? 0,
    sub: "this year",
    icon: TrendingUp,
    color: PALETTE.amber,
    gradient: "bg-linear-to-br from-red-500 to-red-700",
  },
];

export const EmployeeDashboardConfig = (data: any) => ({
  PendingCardsConfig: dashboardCards(data),
  statCards: employeeStatCards(data?.stats ?? {}),
});
