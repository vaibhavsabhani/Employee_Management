"use client";

import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import {
  useLazyGetTimeEntryQuery,
  useResubmitTimeEntryMutation,
} from "@/src/store/action/time-entry/timeEntry";
import { AlertCircle, Clock, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fmtMins = (mins: number) => `${((mins ?? 0) / 60).toFixed(1)}h`;

const fmtDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const entryId = params?.timeEntryId as string;

  const [getTimeEntry, { isFetching }] = useLazyGetTimeEntryQuery();
  const [resubmitTimeEntry, { isLoading: isResubmitting }] =
    useResubmitTimeEntryMutation();

  const [entry, setEntry] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");

  // "add" is no longer a valid route now that entries are punched in.
  useEffect(() => {
    if (!entryId || entryId === "add") {
      router.replace("/time-entry");
      return;
    }
    getTimeEntry(entryId)
      .unwrap()
      .then((res) => {
        const e = res?.data;
        if (!e) return;
        setEntry(e);
        setNotes(e.notes ?? "");
      })
      .catch(() => {});
  }, [entryId, getTimeEntry, router]);

  const handleResubmit = async () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      setNotesError("Please update your work notes before resubmitting.");
      return;
    }
    const res = await resubmitTimeEntry({ id: entryId, notes: trimmed });
    if ((res as any)?.error) {
      Toast(res, "error");
      return;
    }
    Toast(res, "success");
    router.push("/time-entry");
  };

  const detail = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit & Resubmit Time Entry"
        description="Your punched hours can't change — update your work notes and resubmit for approval."
      />

      {entry?.rejectionReason && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          <AlertCircle className="size-5 mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
          <div>
            <p className="text-sm font-semibold">Rejected by admin</p>
            <p className="text-sm mt-0.5">{entry.rejectionReason}</p>
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Clock className="size-5" />
            </div>
            <CardTitle className="text-lg font-semibold">
              Time Entry Details
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {isFetching && !entry ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Read-only punched details */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                {detail("Date", fmtDate(entry?.date))}
                {detail("Start Time", entry?.startTime ?? "—")}
                {detail("End Time", entry?.endTime ?? "—")}
                {detail("Break", `${entry?.breakDuration ?? 0} min`)}
                {detail("Working Hours", fmtMins(entry?.duration))}
              </div>

              {/* Editable notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="resubmit-notes" className="text-sm font-medium">
                    Work Notes <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {notes.length}/1000
                  </span>
                </div>
                <Textarea
                  id="resubmit-notes"
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
                    notesError ? "border-red-500 focus-visible:ring-red-500/30" : ""
                  }
                />
                {notesError && (
                  <p className="text-xs font-medium text-red-500">{notesError}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-6 h-10 border-btn-outline-ring text-btn-outline-fg font-semibold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleResubmit}
          disabled={isResubmitting || !notes.trim() || !entry}
          className="px-6 h-10 flex items-center gap-2"
        >
          {isResubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isResubmitting ? "Resubmitting…" : "Resubmit for Approval"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
