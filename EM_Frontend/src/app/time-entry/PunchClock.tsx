"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Coffee,
  LogIn,
  LogOut,
  Loader2,
  Clock,
  CheckCircle2,
  Utensils,
  CalendarOff,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Toast } from "@/src/components/custom/Toast";
import {
  useActiveTimeEntryQuery,
  usePunchMutation,
} from "@/src/store/action/time-entry/timeEntry";

type PunchState = "not_clocked_in" | "working" | "on_lunch" | "completed";
type PunchAction = "clock-in" | "lunch-start" | "lunch-end" | "clock-out";

/** Build today's Date from a "HH:mm" string. */
const todayAt = (hhmm?: string | null): Date | null => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const fmtDuration = (ms: number): string => {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
};

export const PunchClock = ({ onChanged }: { onChanged?: () => void }) => {
  const { data: active, refetch, isLoading } = useActiveTimeEntryQuery(undefined);

  const [punch, { isLoading: busy }] = usePunchMutation();
  // which action is currently in-flight (for per-button spinners)
  const [pending, setPending] = useState<PunchAction | null>(null);

  const [showClockOut, setShowClockOut] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");

  // re-render every second so the live timer ticks
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const state: PunchState = (active?.state as PunchState) ?? "not_clocked_in";
  const entry = active?.data;

  const leave = active?.leave;
  const onFullDayLeave = !!leave && !leave.isHalfDay;
  const onHalfDayLeave = !!leave && leave.isHalfDay;
  const leaveTypeName = leave?.leaveType?.name ?? "leave";

  const runPunch = async (
    action: PunchAction,
    fallbackMsg: string,
    notesArg?: string,
  ) => {
    setPending(action);
    const res = await punch(
      notesArg !== undefined ? { action, notes: notesArg } : { action },
    );
    setPending(null);
    if (res?.error) {
      Toast(res, "error");
      return false;
    }
    Toast(res?.data?.message ? res : { message: fallbackMsg }, "success");
    await refetch();
    onChanged?.();
    return true;
  };

  const handleClockIn = () => runPunch("clock-in", "Clocked in");
  const handleLunchStart = () => runPunch("lunch-start", "Lunch started");
  const handleLunchEnd = () => runPunch("lunch-end", "Back from lunch");

  const handleClockOut = async () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      setNotesError("Please add a note about today's work before clocking out.");
      return;
    }
    const ok = await runPunch("clock-out", "Clocked out", trimmed);
    if (ok) {
      setShowClockOut(false);
      setNotes("");
      setNotesError("");
    }
  };

  const closeClockOut = (open: boolean) => {
    setShowClockOut(open);
    if (!open) {
      setNotes("");
      setNotesError("");
    }
  };

  // ---- live worked / break time ----
  const { workedLabel, breakLabel, statusMeta } = useMemo(() => {
    const now = Date.now();
    const start = todayAt(entry?.startTime);
    const lunchOut = entry?.lunchOutAt ? new Date(entry.lunchOutAt) : null;
    const storedBreakMs = (entry?.breakDuration ?? 0) * 60000;

    // total break so far (stored + currently-running lunch)
    let breakMs = storedBreakMs;
    if (state === "on_lunch" && lunchOut) {
      breakMs = now - lunchOut.getTime();
    }

    let workedMs = 0;
    if (state === "completed") {
      workedMs = (entry?.duration ?? 0) * 60000;
    } else if (start) {
      const elapsed = now - start.getTime();
      workedMs = elapsed - breakMs;
    }

    const meta: Record<PunchState, { label: string; className: string }> = {
      not_clocked_in: {
        label: "Not clocked in",
        className: "bg-stat-amber-icon text-stat-amber-icon-fg",
      },
      working: {
        label: "Working",
        className: "bg-stat-green-icon text-stat-green-icon-fg",
      },
      on_lunch: {
        label: "On lunch",
        className: "bg-stat-amber-icon text-stat-amber-icon-fg",
      },
      completed: {
        label: "Day complete",
        className: "bg-stat-green-icon text-stat-green-icon-fg",
      },
    };

    return {
      workedLabel: fmtDuration(workedMs),
      breakLabel: fmtDuration(breakMs),
      statusMeta: meta[state],
    };
  }, [entry, state]);

  return (
    <Card className="border border-stat-green-ring bg-stat-green-card">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Status + live stats */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusMeta.className}`}>
              {onFullDayLeave && state === "not_clocked_in" ? (
                <CalendarOff className="size-6" />
              ) : (
                <Clock className="size-6" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stat-green-label">
                Today&apos;s Status
              </p>
              <p className="text-2xl font-bold text-stat-green-value">
                {onFullDayLeave && state === "not_clocked_in"
                  ? "On Leave"
                  : statusMeta.label}
              </p>
              {onFullDayLeave ? (
                <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                  You&apos;re on {leaveTypeName} today.
                </p>
              ) : onHalfDayLeave && state === "not_clocked_in" ? (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5 capitalize">
                  Half-day {leaveTypeName} today — you can still clock in.
                </p>
              ) : state !== "not_clocked_in" ? (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {entry?.startTime && <>In {entry.startTime}</>}
                  {entry?.endTime && <> · Out {entry.endTime}</>}
                  {" · "}Worked {workedLabel}
                  {" · "}Break {breakLabel}
                </p>
              ) : null}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : state === "not_clocked_in" ? (
              onFullDayLeave ? (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <CalendarOff className="size-5" />
                  Clock-in disabled while on leave
                </div>
              ) : (
                <Button onClick={handleClockIn} disabled={busy} className="h-11 px-6">
                  {pending === "clock-in" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  Clock In
                </Button>
              )
            ) : state === "working" ? (
              <>
                {!entry?.lunchOutAt && (
                  <Button
                    onClick={handleLunchStart}
                    disabled={busy}
                    variant="outline"
                    className="h-11 px-6"
                  >
                    {pending === "lunch-start" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Coffee className="size-4" />
                    )}
                    Leaving for Lunch
                  </Button>
                )}
                <Button
                  onClick={() => setShowClockOut(true)}
                  disabled={busy}
                  variant="destructive"
                  className="h-11 px-6"
                >
                  <LogOut className="size-4" />
                  Clock Out
                </Button>
              </>
            ) : state === "on_lunch" ? (
              <Button onClick={handleLunchEnd} disabled={busy} className="h-11 px-6">
                {pending === "lunch-end" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Utensils className="size-4" />
                )}
                Back from Lunch
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-stat-green-value font-semibold">
                <CheckCircle2 className="size-5" />
                You&apos;re done for today
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Clock-out notes dialog */}
      <Dialog open={showClockOut} onOpenChange={closeClockOut}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex-row items-center gap-3 space-y-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-stat-green-icon text-stat-green-icon-fg">
              <LogOut className="size-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">Clock Out</DialogTitle>
              <DialogDescription>
                Wrap up your day. Working hours and break are calculated
                automatically.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Summary of today's totals */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg border border-stat-green-ring bg-stat-green-card px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-stat-green-label">
                Worked
              </p>
              <p className="text-lg font-bold text-stat-green-value">
                {workedLabel}
              </p>
            </div>
            <div className="flex-1 rounded-lg border border-stat-amber-ring bg-stat-amber-card px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-stat-amber-label">
                Break
              </p>
              <p className="text-lg font-bold text-stat-amber-value">
                {breakLabel}
              </p>
            </div>
          </div>

          {/* Required work notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="clockout-notes" className="text-sm font-medium">
                Work Notes <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {notes.length}/1000
              </span>
            </div>
            <Textarea
              id="clockout-notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesError) setNotesError("");
              }}
              placeholder="Describe what you worked on today..."
              rows={5}
              maxLength={1000}
              aria-invalid={!!notesError}
              className={
                notesError
                  ? "border-red-500 focus-visible:ring-red-500/30"
                  : ""
              }
            />
            {notesError && (
              <p className="text-xs font-medium text-red-500">{notesError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => closeClockOut(false)}
              disabled={pending === "clock-out"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={pending === "clock-out" || !notes.trim()}
            >
              {pending === "clock-out" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              Confirm Clock Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PunchClock;
