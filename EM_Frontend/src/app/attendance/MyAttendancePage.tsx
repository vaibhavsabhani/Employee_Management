"use client";

import { Skeleton } from "@/src/components/ui/skeleton";
import { LEAVE_TYPE_MAP } from "@/src/constant/constant";
import { useLazyGetMyAttendanceQuery } from "@/src/store/action/attendance/attendance";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  Flame,
  Loader2,
  Plane,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ── types ──────────────────────────────────────── */
type AttendanceStats = {
  totalDays: number;
  present: number;
  absent: number;
  onLeave: number;
  notMarked: number;
};

type Status = "present" | "absent" | "on-leave" | "not-marked";

type DayRecord = {
  date: string;
  effectiveStatus: Status;
  leaveType: { id: number; name: string } | null;
  markedBy: { firstName: string; lastName: string } | null;
  notes: string | null;
};

type Cell = {
  day: number;
  dateStr: string;
  record: DayRecord | null;
  isFuture: boolean;
  isToday: boolean;
  isWeekend: boolean;
} | null;

/* ── date helpers ───────────────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function formatMonthLabel(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── status visual config ───────────────────────── */
const STATUS_META: Record<
  Status,
  {
    label: string;
    soft: string;
    softText: string;
    solid: string;
    dot: string;
    bar: string;
    icon: React.ElementType;
  }
> = {
  present: {
    label: "Present",
    soft: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25",
    softText: "text-emerald-700 dark:text-emerald-300",
    solid: "bg-emerald-500 text-white",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    icon: Check,
  },
  absent: {
    label: "Absent",
    soft: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25",
    softText: "text-rose-700 dark:text-rose-300",
    solid: "bg-rose-500 text-white",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    icon: X,
  },
  "on-leave": {
    label: "On Leave",
    soft: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25",
    softText: "text-indigo-700 dark:text-indigo-300",
    solid: "bg-indigo-500 text-white",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
    icon: Plane,
  },
  "not-marked": {
    label: "Not Marked",
    soft: "bg-card border-border",
    softText: "text-muted-foreground",
    solid: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
    dot: "bg-slate-300 dark:bg-slate-600",
    bar: "bg-slate-300 dark:bg-slate-700",
    icon: CircleDashed,
  },
};

/* ── animated count-up ──────────────────────────── */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ── gradient progress ring ─────────────────────── */
function AttendanceRing({ percent }: { percent: number | null }) {
  const animated = useCountUp(percent ?? 0);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - ((percent ?? 0) / 100) * circ;
  return (
    <div className="relative size-44 shrink-0">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <defs>
          <linearGradient id="att-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#att-ring)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-5xl font-black leading-none tracking-tight text-transparent">
          {percent === null ? "—" : animated}
          {percent !== null && <span className="text-2xl">%</span>}
        </span>
        <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Present rate
        </span>
      </div>
    </div>
  );
}

/* ── metric tile ────────────────────────────────── */
function StatTile({
  status,
  value,
  total,
  delay,
}: {
  status: Status;
  value: number;
  total: number;
  delay: number;
}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const animated = useCountUp(value);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className="att-rise group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${meta.solid} transition-transform group-hover:scale-110`}
        >
          <Icon className="size-4.5" />
        </span>
        <span className="text-3xl font-black tabular-nums text-foreground">
          {animated}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </p>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${meta.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── insight row ────────────────────────────────── */
function InsightRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
      <span className={`flex size-9 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ── skeleton ───────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
    </div>
  );
}

/* ════════════════════════════════════════════════ */
const MyAttendancePage = () => {
  const thisMonth = currentMonthStr();
  const today = todayStr();
  const [month, setMonth] = useState(thisMonth);
  const [data, setData] = useState<DayRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    notMarked: 0,
  });
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const [getMyAttendance] = useLazyGetMyAttendanceQuery();

  const load = useCallback(
    async (m: string) => {
      setLoading(true);
      try {
        const res = await getMyAttendance({ month: m }).unwrap();
        setData(res?.data ?? []);
        setStats(
          res?.stats ?? {
            totalDays: 0,
            present: 0,
            absent: 0,
            onLeave: 0,
            notMarked: 0,
          },
        );
      } catch {
        setData([]);
        setStats({
          totalDays: 0,
          present: 0,
          absent: 0,
          onLeave: 0,
          notMarked: 0,
        });
      } finally {
        initialized.current = true;
        setLoading(false);
      }
    },
    [getMyAttendance],
  );

  useEffect(() => {
    load(month);
  }, [month, load]);

  const cells = useMemo<Cell[]>(() => {
    const [y, m] = month.split("-").map(Number);
    const startWeekday = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const recordMap = new Map(data.map((d) => [d.date, d]));
    const out: Cell[] = [];
    for (let i = 0; i < startWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${pad(m)}-${pad(d)}`;
      const weekday = new Date(y, m - 1, d).getDay();
      out.push({
        day: d,
        dateStr,
        record: recordMap.get(dateStr) ?? null,
        isFuture: dateStr > today,
        isToday: dateStr === today,
        isWeekend: weekday === 0 || weekday === 6,
      });
    }
    return out;
  }, [month, data, today]);

  const activity = useMemo(
    () => data.filter((d) => d.effectiveStatus !== "not-marked").slice(0, 6),
    [data],
  );

  // current present streak (data is most-recent-first; absent breaks it)
  const streak = useMemo(() => {
    let s = 0;
    for (const d of data) {
      if (d.effectiveStatus === "present") s++;
      else if (d.effectiveStatus === "absent") break;
    }
    return s;
  }, [data]);

  const denom = stats.present + stats.absent;
  const percent = denom > 0 ? Math.round((stats.present / denom) * 100) : null;
  const trackedDays = stats.present + stats.absent + stats.onLeave;
  const totalForBar =
    stats.present + stats.absent + stats.onLeave + stats.notMarked || 1;

  const distribution = (
    [
      ["present", stats.present],
      ["absent", stats.absent],
      ["on-leave", stats.onLeave],
      ["not-marked", stats.notMarked],
    ] as const
  ).filter(([, v]) => v > 0);

  const firstLoad = loading && !initialized.current;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes attRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes attPop  { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); } }
        .att-rise { animation: attRise .5s ease-out backwards; }
        .att-pop  { animation: attPop .3s cubic-bezier(.34,1.56,.64,1) backwards; }
      `}</style>

      {/* ── Header + month nav ───────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Attendance
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your monthly attendance at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMonth((m) => addMonth(m, -1))}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-36 rounded-xl border border-border bg-card px-3 py-2 text-center text-sm font-semibold text-foreground">
            {formatMonthLabel(month)}
          </div>
          <button
            onClick={() => setMonth((m) => addMonth(m, 1))}
            disabled={month >= thisMonth}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
          {month !== thisMonth && (
            <button
              onClick={() => setMonth(thisMonth)}
              className="h-9 shrink-0 rounded-xl bg-sidebar-primary px-3 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {firstLoad ? (
        <PageSkeleton />
      ) : (
        <>
          {/* ── Hero: ring + distribution ────────── */}
          <div className="att-rise grid gap-8 rounded-3xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex flex-col items-center gap-3">
              <AttendanceRing percent={percent} />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                <Sparkles className="size-3.5" /> {formatMonthLabel(month)}
              </div>

              <p className="mt-3 text-lg font-semibold text-foreground sm:text-xl">
                {percent === null ? (
                  <>No working days marked yet this month.</>
                ) : (
                  <>
                    You were present on{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {stats.present}
                    </span>{" "}
                    of {denom} marked {denom === 1 ? "day" : "days"}
                    {stats.onLeave > 0 && (
                      <>
                        {" "}
                        and took{" "}
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {stats.onLeave}
                        </span>{" "}
                        leave
                      </>
                    )}
                    .
                  </>
                )}
              </p>

              {/* distribution bar */}
              <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {distribution.map(([k, v]) => (
                  <div
                    key={k}
                    className={`${STATUS_META[k].bar} transition-[width] duration-700 ease-out`}
                    style={{ width: `${(v / totalForBar) * 100}%` }}
                    title={`${STATUS_META[k].label}: ${v}`}
                  />
                ))}
              </div>

              {/* legend */}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {(["present", "absent", "on-leave", "not-marked"] as const).map(
                  (k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${STATUS_META[k].dot}`} />
                      <span className="text-xs text-muted-foreground">
                        {STATUS_META[k].label}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {k === "present"
                          ? stats.present
                          : k === "absent"
                            ? stats.absent
                            : k === "on-leave"
                              ? stats.onLeave
                              : stats.notMarked}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* ── Metric tiles ─────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile status="present" value={stats.present} total={stats.totalDays} delay={0} />
            <StatTile status="absent" value={stats.absent} total={stats.totalDays} delay={70} />
            <StatTile status="on-leave" value={stats.onLeave} total={stats.totalDays} delay={140} />
            <StatTile status="not-marked" value={stats.notMarked} total={stats.totalDays} delay={210} />
          </div>

          {/* ── Calendar ─────────────────────────── */}
          <div className="att-rise relative rounded-3xl border border-border bg-card p-4 sm:p-6">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-card/60 backdrop-blur-[1px]">
                <Loader2 className="size-7 animate-spin text-violet-500" />
              </div>
            )}

            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <CalendarDays className="size-4.5 text-violet-500" />
              Monthly Calendar
            </h2>

            <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={`text-center text-[10px] font-bold uppercase tracking-wider ${
                    i === 0 || i === 6 ? "text-violet-400" : "text-muted-foreground"
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`b-${i}`} />;
                const { day, record, isFuture, isToday, isWeekend, dateStr } = cell;

                if (isFuture) {
                  return (
                    <div
                      key={dateStr}
                      className={`flex min-h-16 flex-col rounded-xl border border-dashed border-border/60 p-2 sm:min-h-20 ${
                        isWeekend ? "bg-muted/20" : ""
                      }`}
                    >
                      <span className="text-sm font-semibold text-muted-foreground/35">
                        {day}
                      </span>
                    </div>
                  );
                }

                const status: Status = record?.effectiveStatus ?? "not-marked";
                const meta = STATUS_META[status];
                const Icon = meta.icon;
                const isMarked = status !== "not-marked";

                return (
                  <div
                    key={dateStr}
                    title={`${day} — ${meta.label}`}
                    style={{ animationDelay: `${i * 12}ms` }}
                    className={`att-pop group relative flex min-h-16 flex-col overflow-hidden rounded-xl border p-2 transition-all duration-150 hover:z-10 hover:-translate-y-0.5 hover:shadow-md sm:min-h-20 ${meta.soft} ${
                      !isMarked && isWeekend ? "bg-muted/30" : ""
                    } ${isToday ? "ring-2 ring-inset ring-violet-500" : ""}`}
                  >
                    {/* status accent strip */}
                    {isMarked && (
                      <span
                        className={`absolute inset-x-0 top-0 h-1 ${meta.bar}`}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold leading-none ${
                          isMarked ? meta.softText : "text-foreground/70"
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-white">
                          Today
                        </span>
                      )}
                    </div>

                    {isMarked && (
                      <div className={`mt-auto flex items-center gap-1 ${meta.softText}`}>
                        <Icon className="size-3 shrink-0" />
                        <span className="truncate text-[10px] font-semibold sm:text-[11px]">
                          {meta.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Activity + Insights ──────────────── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* recent activity */}
            <div className="att-rise rounded-3xl border border-border bg-card p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4.5 text-violet-500" />
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Days with a recorded status this month
                  </p>
                </div>
              </div>

              {activity.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Clock3 className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No attendance recorded yet this month.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {activity.map((row, idx) => {
                    const meta = STATUS_META[row.effectiveStatus];
                    const Icon = meta.icon;
                    const lt = row.leaveType
                      ? LEAVE_TYPE_MAP[row.leaveType.id]
                      : null;
                    const [y, m, d] = row.date.split("-").map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    return (
                      <div
                        key={row.date}
                        className="att-rise flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:bg-muted/40"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.solid}`}
                        >
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {dateObj.toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {meta.label}
                            {row.markedBy &&
                              ` · by ${row.markedBy.firstName} ${row.markedBy.lastName}`}
                          </p>
                        </div>
                        {row.effectiveStatus === "on-leave" && row.leaveType && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              lt?.className ?? "bg-badge-info text-badge-info-fg"
                            }`}
                          >
                            {lt?.label ?? row.leaveType.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* insights */}
            <div className="att-rise rounded-3xl border border-border bg-card p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Sparkles className="size-4.5 text-violet-500" />
                Insights
              </h2>

              <div className="mt-5 space-y-3">
                <InsightRow
                  icon={Flame}
                  label="Current present streak"
                  value={`${streak} ${streak === 1 ? "day" : "days"}`}
                  accent="bg-amber-500 text-white"
                />
                <InsightRow
                  icon={CalendarCheck}
                  label="Days tracked this month"
                  value={`${trackedDays} ${trackedDays === 1 ? "day" : "days"}`}
                  accent="bg-violet-500 text-white"
                />
                <InsightRow
                  icon={Check}
                  label="Attendance rate"
                  value={percent === null ? "—" : `${percent}%`}
                  accent="bg-emerald-500 text-white"
                />
                <InsightRow
                  icon={Plane}
                  label="On leave"
                  value={`${stats.onLeave} ${stats.onLeave === 1 ? "day" : "days"}`}
                  accent="bg-indigo-500 text-white"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendancePage;
