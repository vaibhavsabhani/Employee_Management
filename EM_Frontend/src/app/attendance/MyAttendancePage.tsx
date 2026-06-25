"use client";

import { PageHeader } from "@/src/components/custom/PageHeader";
import { Skeleton } from "@/src/components/ui/skeleton";
import { LEAVE_TYPE_MAP } from "@/src/constant/constant";
import { useLazyGetMyAttendanceQuery } from "@/src/store/action/attendance/attendance";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
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
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── status visual config ───────────────────────── */
const STATUS_META: Record<
  Status,
  { label: string; soft: string; softText: string; chip: string; dot: string; icon: React.ElementType }
> = {
  present: {
    label: "Present",
    soft: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
    softText: "text-emerald-700 dark:text-emerald-300",
    chip: "bg-linear-to-br from-emerald-400 to-emerald-600 text-white",
    dot: "bg-emerald-500",
    icon: Check,
  },
  absent: {
    label: "Absent",
    soft: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",
    softText: "text-rose-700 dark:text-rose-300",
    chip: "bg-linear-to-br from-rose-400 to-rose-600 text-white",
    dot: "bg-rose-500",
    icon: X,
  },
  "on-leave": {
    label: "On Leave",
    soft: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30",
    softText: "text-indigo-700 dark:text-indigo-300",
    chip: "bg-linear-to-br from-indigo-400 to-indigo-600 text-white",
    dot: "bg-indigo-500",
    icon: Plane,
  },
  "not-marked": {
    label: "Not Marked",
    soft: "bg-card border-border",
    softText: "text-muted-foreground",
    chip: "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300",
    dot: "bg-slate-300 dark:bg-slate-600",
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

/* ── attendance ring ────────────────────────────── */
function AttendanceRing({ percent }: { percent: number | null }) {
  const animated = useCountUp(percent ?? 0);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - ((percent ?? 0) / 100) * circ;
  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={radius} fill="none" stroke="white" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black leading-none tracking-tight">
          {percent === null ? "—" : `${animated}%`}
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
          Present
        </span>
      </div>
    </div>
  );
}

/* ── stat card ──────────────────────────────────── */
function StatCard({
  status, value, total, delay,
}: { status: Status; value: number; total: number; delay: number }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const animated = useCountUp(value);
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div
      className="att-rise group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className={`flex size-9 items-center justify-center rounded-xl ${meta.chip}`}>
          <Icon className="size-4.5" />
        </div>
        <span className="text-3xl font-black tabular-nums text-foreground">{animated}</span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {meta.label}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${meta.chip} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── full skeleton ──────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
      <Skeleton className="h-48 w-full rounded-3xl" />
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
    totalDays: 0, present: 0, absent: 0, onLeave: 0, notMarked: 0,
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
        if (res?.stats) setStats(res.stats);
        else setStats({ totalDays: 0, present: 0, absent: 0, onLeave: 0, notMarked: 0 });
      } catch {
        setData([]);
        setStats({ totalDays: 0, present: 0, absent: 0, onLeave: 0, notMarked: 0 });
      } finally {
        initialized.current = true;
        setLoading(false);
      }
    },
    [getMyAttendance],
  );

  useEffect(() => { load(month); }, [month, load]);

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

  const denom = stats.present + stats.absent;
  const percent = denom > 0 ? Math.round((stats.present / denom) * 100) : null;
  const trackedDays = stats.present + stats.absent + stats.onLeave;

  const firstLoad = loading && !initialized.current;

  return (
    <div className="space-y-6">
      {/* keyframes */}
      <style>{`
        @keyframes attRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes attPop  { from { opacity: 0; transform: scale(.75); } to { opacity: 1; transform: scale(1); } }
        .att-rise { animation: attRise .5s ease-out backwards; }
        .att-pop  { animation: attPop .35s cubic-bezier(.34,1.56,.64,1) backwards; }
      `}</style>

      <PageHeader title="My Attendance" description="Your monthly attendance at a glance." />

      {firstLoad ? (
        <PageSkeleton />
      ) : (
        <>
          {/* ── HERO ─────────────────────────────── */}
          <div className="att-rise relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-violet-600 to-indigo-700 p-6 text-white sm:p-8">
            {/* dotted texture + blobs */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-indigo-400/20 blur-2xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* left: title + nav + summary */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <Sparkles className="size-3.5" /> Attendance Overview
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setMonth((m) => addMonth(m, -1))}
                    className="flex size-9 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <h2 className="min-w-44 text-center text-2xl font-black tracking-tight sm:text-3xl">
                    {formatMonthLabel(month)}
                  </h2>
                  <button
                    onClick={() => setMonth((m) => addMonth(m, 1))}
                    disabled={month >= thisMonth}
                    className="flex size-9 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  {month !== thisMonth && (
                    <button
                      onClick={() => setMonth(thisMonth)}
                      className="ml-1 h-9 rounded-xl bg-white/15 px-3 text-xs font-semibold transition hover:bg-white/25"
                    >
                      Today
                    </button>
                  )}
                </div>

                <p className="mt-4 max-w-md text-sm text-white/80">
                  {percent === null ? (
                    <>No working days marked yet this month.</>
                  ) : (
                    <>
                      You were present on{" "}
                      <span className="font-bold text-white">{stats.present}</span> of{" "}
                      <span className="font-bold text-white">{denom}</span> marked working{" "}
                      {denom === 1 ? "day" : "days"}
                      {stats.onLeave > 0 && (
                        <> · <span className="font-bold text-white">{stats.onLeave}</span> on leave</>
                      )}
                      .
                    </>
                  )}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(["present", "absent", "on-leave"] as const).map((k) => (
                    <div
                      key={k}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
                    >
                      <span className={`size-2 rounded-full ${STATUS_META[k].dot}`} />
                      {STATUS_META[k].label}
                      <span className="font-black">
                        {k === "present" ? stats.present : k === "absent" ? stats.absent : stats.onLeave}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* right: ring */}
              <div className="flex items-center justify-center">
                <AttendanceRing percent={percent} />
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ───────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard status="present"    value={stats.present}   total={stats.totalDays} delay={0} />
            <StatCard status="absent"     value={stats.absent}    total={stats.totalDays} delay={70} />
            <StatCard status="on-leave"   value={stats.onLeave}   total={stats.totalDays} delay={140} />
            <StatCard status="not-marked" value={stats.notMarked} total={stats.totalDays} delay={210} />
          </div>

          {/* ── CALENDAR ─────────────────────────── */}
          <div className="att-rise relative rounded-3xl border border-border bg-card p-6">
            {/* month-change spinner overlay */}
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-card/60 backdrop-blur-[1px]">
                <Loader2 className="size-7 animate-spin text-violet-500" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <CalendarDays className="size-4.5 text-violet-500" />
                Monthly Calendar
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {(["present", "absent", "on-leave", "not-marked"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <span className={`size-3 rounded-md ${STATUS_META[k].dot}`} />
                    <span className="text-[11px] text-muted-foreground">{STATUS_META[k].label}</span>
                  </div>
                ))}
              </div>
            </div>

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
                      className={`flex min-h-15 flex-col rounded-xl border border-dashed border-border/60 p-2 sm:min-h-19 ${
                        isWeekend ? "bg-muted/20" : ""
                      }`}
                    >
                      <span className="text-sm font-semibold text-muted-foreground/35">{day}</span>
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
                    style={{ animationDelay: `${i * 14}ms` }}
                    className={`att-pop group relative flex min-h-15 flex-col rounded-xl border p-2 transition-all duration-150 hover:z-10 hover:-translate-y-0.5 hover:shadow-md sm:min-h-19 ${meta.soft} ${
                      !isMarked && isWeekend ? "bg-muted/30" : ""
                    } ${isToday ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-card" : ""}`}
                  >
                    {/* day number + today marker */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold leading-none ${isMarked ? meta.softText : "text-foreground/70"}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-white">
                          Today
                        </span>
                      )}
                    </div>

                    {/* status badge (only for marked days) */}
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

          {/* ── ACTIVITY TIMELINE ────────────────── */}
          <div className="att-rise rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4.5 text-violet-500" />
              <div>
                <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
                <p className="text-xs text-muted-foreground">Days with a recorded status this month</p>
              </div>
            </div>

            {activity.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-2 py-8 text-center">
                <CalendarDays className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No attendance recorded yet this month.</p>
              </div>
            ) : (
              <div className="relative mt-5 pl-4">
                {/* connector line */}
                <span className="absolute left-[1.05rem] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {activity.map((row, idx) => {
                    const meta = STATUS_META[row.effectiveStatus];
                    const Icon = meta.icon;
                    const lt = row.leaveType ? LEAVE_TYPE_MAP[row.leaveType.id] : null;
                    const [y, m, d] = row.date.split("-").map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    return (
                      <div
                        key={row.date}
                        className="att-rise relative flex items-center gap-4"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card ${meta.chip}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-1 items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-2.5 transition-colors hover:bg-muted/60">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meta.label}
                              {row.markedBy && ` · by ${row.markedBy.firstName} ${row.markedBy.lastName}`}
                            </p>
                          </div>
                          {row.effectiveStatus === "on-leave" && row.leaveType && (
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${lt?.className ?? "bg-badge-info text-badge-info-fg"}`}>
                              {lt?.label ?? row.leaveType.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendancePage;
