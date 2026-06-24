"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import Filter from "@/src/components/custom/filters";
import DateInput from "@/src/components/custom/DateInput";
import { STATUS_MAP, TIME_ENTRY_STATUS } from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import { useLazyMeTimeEntriesQuery } from "@/src/store/action/time-entry/timeEntry";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle2, Clock, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useTimeEntrySocket } from "@/src/hooks/useTimeEntrySocket";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

const fmtMins = (mins: number) => `${(mins / 60).toFixed(1)}h`;

const defaultFilters = { statusId: "", startDate: "", endDate: "" };

const DateFilterPanel = ({
  draftDates,
  setDraftDates,
  onApply,
  onReset,
}: {
  draftDates: { startDate: string; endDate: string };
  setDraftDates: React.Dispatch<React.SetStateAction<{ startDate: string; endDate: string }>>;
  onApply: () => void;
  onReset: () => void;
  closeFilter?: () => void;
}) => (
  <div className="flex flex-col xl:flex-row xl:items-end gap-4 p-3 w-full">
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">From Date</label>
      <DateInput
        value={draftDates.startDate}
        onChange={(date) =>
          setDraftDates((prev) => ({ ...prev, startDate: date ?? "" }))
        }
        maxDate={draftDates.endDate ? new Date(draftDates.endDate) : undefined}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">To Date</label>
      <DateInput
        value={draftDates.endDate}
        onChange={(date) =>
          setDraftDates((prev) => ({ ...prev, endDate: date ?? "" }))
        }
        minDate={
          draftDates.startDate ? new Date(draftDates.startDate) : undefined
        }
      />
    </div>
    <div className="flex gap-3 xl:pb-0 pb-1 shrink-0">
      <Button
        onClick={onApply}
        className="flex-1 xl:flex-none h-10 px-6 bg-sidebar-primary hover:bg-violet-700 text-white"
      >
        Apply filter
      </Button>
      <Button
        onClick={onReset}
        variant="outline"
        className="flex-1 xl:flex-none h-10 px-6"
      >
        Reset filter
      </Button>
    </div>
  </div>
);

const TimeEntryPage = () => {
  const router = useRouter();

  const [getTimeEntries] = useLazyMeTimeEntriesQuery();
  const [draftDates, setDraftDates] = useState({ startDate: "", endDate: "" });

  const fetchTimeEntries = useCallback(
    async ({ page, limit, ...filters }: any) => {
      const res = await getTimeEntries({ page, limit, ...filters }).unwrap();
      return res;
    },
    [getTimeEntries],
  );

  const transformTimeEntryResponse = useCallback(
    (res: any) => ({
      data: res?.data || [],
      total: res?.total || 0,
    }),
    [],
  );

  const {
    data,
    loading,
    page,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    updateFilters,
    filters,
    totalPages,
    total,
    limit,
    setLimit,
    resetLimit,
    refetch,
  } = usePaginatedQuery(fetchTimeEntries, {
    defaultFilters,
    transformResponse: transformTimeEntryResponse,
  });

  // auto-refresh when admin approves or rejects this employee's entry
  useTimeEntrySocket((type) => {
    if (type === "time_entry_approved" || type === "time_entry_rejected") {
      refetch();
    }
  });

  const stats = useMemo(() => {
    const totals = (data as any[])?.reduce(
      (acc: { pending: number; approved: number }, item: any) => {
        const status = item.status?.name?.toLowerCase();
        if (status === "pending") acc.pending += item.duration;
        if (status === "approved") acc.approved += item.duration;
        return acc;
      },
      { pending: 0, approved: 0 },
    );

    const format = (minutes: number) => ({
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    });

    return {
      pendingHours: format(totals?.pending || 0),
      approvedHours: format(totals?.approved || 0),
    };
  }, [data]);

  const activeStatus = (filters as any)?.statusId ?? "";

  const handleApplyFilter = () => {
    resetLimit();
    updateFilters({ ...(filters as any), ...draftDates });
  };

  const handleResetFilter = () => {
    setDraftDates({ startDate: "", endDate: "" });
    resetLimit();
    updateFilters(defaultFilters);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    { accessorKey: "startTime", header: "Start Time" },
    { accessorKey: "endTime", header: "End Time" },
    {
      accessorKey: "breakDuration",
      header: "Break Time",
      cell: ({ row }) => `${row.original.breakDuration ?? 0} min`,
    },
    {
      accessorKey: "duration",
      header: "Working Hours",
      cell: ({ row }) => fmtMins(row.original.duration ?? 0),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="max-w-50 truncate block text-slate-500 dark:text-slate-400 text-sm">
          {row.original.notes || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const sid: number = row.original.statusId;
        const reason: string | undefined = row.original.rejectionReason;
        const s = STATUS_MAP[sid] ?? {
          label: "Unknown",
          className: "bg-badge-neutral text-badge-neutral-fg",
        };
        const badge = (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}
          >
            {sid === 3 && <AlertCircle className="size-3" />}
            {s.label}
          </span>
        );
        if (sid === 3 && reason) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-60 text-xs">
                <span className="font-semibold">Rejection reason:</span>{" "}
                {reason}
              </TooltipContent>
            </Tooltip>
          );
        }
        return badge;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (row.original.statusId !== 3) return null;
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs border-btn-outline-ring text-btn-outline-fg hover:border-violet-400 hover:text-violet-700"
            onClick={() => router.push(`/time-entry/${row.original.id}`)}
          >
            <Pencil className="size-3 mr-1" />
            Edit &amp; Resubmit
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Time Entries"
        description="Track your daily work hours."
        action={
          <Button onClick={() => router.push("/time-entry/add")}>
            <Plus className="size-4 mr-1" />
            Add Entry
          </Button>
        }
      />

      <div className="flex gap-4 sm:flex-row flex-col" id="time-entry-stats">
        <Card className="border border-stat-amber-ring bg-stat-amber-card flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-stat-amber-icon text-stat-amber-icon-fg">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-stat-amber-label font-medium uppercase tracking-wide">
                Pending Hours
              </p>
              <p className="text-2xl font-bold text-stat-amber-value">
                {stats.pendingHours.hours}h {stats.pendingHours.minutes}m
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stat-green-ring bg-stat-green-card flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-stat-green-icon text-stat-green-icon-fg">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-stat-green-label font-medium uppercase tracking-wide">
                Approved Hours
              </p>
              <p className="text-2xl font-bold text-stat-green-value">
                {stats.approvedHours.hours}h {stats.approvedHours.minutes}m
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date filter */}
      <Filter>
        <DateFilterPanel
          draftDates={draftDates}
          setDraftDates={setDraftDates}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
      </Filter>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap" id="status-filter">
        {TIME_ENTRY_STATUS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              resetLimit();
              updateFilters({ ...(filters as any), statusId: tab.value });
            }}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeStatus === tab.value
                ? "bg-sidebar-primary text-white border-sidebar-primary"
                : "bg-pill-bg text-pill-fg border-pill-ring hover:border-violet-400 hover:text-violet-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onNext={nextPage}
        onPrev={prevPage}
        canNext={canNext}
        canPrev={canPrev}
        page={page}
        total={totalPages}
        totalRecords={total}
        limit={limit}
        setLimit={setLimit}
        showExtraHeader={["time-entry-stats", "status-filter", "pageHeading"]}
      />
    </div>
  );
};

export default TimeEntryPage;
