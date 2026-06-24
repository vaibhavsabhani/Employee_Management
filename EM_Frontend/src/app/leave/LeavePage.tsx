"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import Filter from "@/src/components/custom/filters";
import DateInput from "@/src/components/custom/DateInput";
import {
  LEAVE_STATUS,
  LEAVE_STATUS_MAP,
  LEAVE_TYPE_MAP,
  LEAVE_TYPE_OPTIONS,
} from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import { useLazyMeLeavesQuery } from "@/src/store/action/leave/leave";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck2, CalendarClock, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useRouter } from "next/navigation";
import { useLeaveSocket } from "@/src/hooks/useLeaveSocket";

type DraftFilters = { leaveTypeId: string; startDate: string; endDate: string };
const defaultFilters = { statusId: "", leaveTypeId: "", startDate: "", endDate: "" };

const LeaveFilterPanel = ({
  draft,
  setDraft,
  onApply,
  onReset,
}: {
  draft: DraftFilters;
  setDraft: React.Dispatch<React.SetStateAction<DraftFilters>>;
  onApply: () => void;
  onReset: () => void;
  closeFilter?: () => void;
}) => (
  <div className="flex flex-col xl:flex-row xl:items-end gap-4 p-3 w-full">
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">Leave Type</label>
      <Select
        value={draft.leaveTypeId}
        onValueChange={(v) => setDraft((prev) => ({ ...prev, leaveTypeId: v }))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {LEAVE_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">From Date</label>
      <DateInput
        value={draft.startDate}
        onChange={(d) => setDraft((prev) => ({ ...prev, startDate: d ?? "" }))}
        maxDate={draft.endDate ? new Date(draft.endDate) : undefined}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">To Date</label>
      <DateInput
        value={draft.endDate}
        onChange={(d) => setDraft((prev) => ({ ...prev, endDate: d ?? "" }))}
        minDate={draft.startDate ? new Date(draft.startDate) : undefined}
      />
    </div>
    <div className="flex gap-3 xl:pb-0 pb-1 shrink-0">
      <Button onClick={onApply} className="flex-1 xl:flex-none h-10 px-6 bg-sidebar-primary hover:bg-violet-700 text-white">
        Apply filter
      </Button>
      <Button onClick={onReset} variant="outline" className="flex-1 xl:flex-none h-10 px-6">
        Reset filter
      </Button>
    </div>
  </div>
);

const LeavePage = () => {
  const router = useRouter();
  const [getLeaves] = useLazyMeLeavesQuery();
  const [draft, setDraft] = useState<DraftFilters>({ leaveTypeId: "", startDate: "", endDate: "" });

  const fetchLeaves = useCallback(
    async ({ page, limit, ...filters }: any) =>
      getLeaves({ page, limit, ...filters }).unwrap(),
    [getLeaves],
  );

  const transformResponse = useCallback(
    (res: any) => ({ data: res?.data || [], total: res?.total || 0 }),
    [],
  );

  const {
    data, loading, page, nextPage, prevPage, canNext, canPrev,
    updateFilters, filters, totalPages, total, limit, setLimit, resetLimit, refetch,
  } = usePaginatedQuery(fetchLeaves, { defaultFilters, transformResponse });

  // auto-refresh when admin approves or rejects a leave
  useLeaveSocket((type) => {
    if (type === "leave_approved" || type === "leave_rejected") {
      refetch();
    }
  });

  const stats = useMemo(() => {
    const pending = data?.filter((l: any) => l.statusId === 1).length ?? 0;
    const approvedDays = data
      ?.filter((l: any) => l.statusId === 2)
      .reduce((s: number, l: any) => s + (l.totalDays ?? 0), 0) ?? 0;
    return { pending, approvedDays };
  }, [data]);

  const activeStatus = (filters as any)?.statusId ?? "";

  const handleApply = () => { resetLimit(); updateFilters({ ...(filters as any), ...draft }); };
  const handleReset = () => { setDraft({ leaveTypeId: "", startDate: "", endDate: "" }); resetLimit(); updateFilters(defaultFilters); };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "leaveType",
      header: "Leave Type",
      cell: ({ row }) => {
        const id: number = row.original.leaveTypeId;
        const t = LEAVE_TYPE_MAP[id];
        return t ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.className}`}>
            {t.label}
          </span>
        ) : row.original.leaveType?.name ?? "—";
      },
    },
    {
      accessorKey: "startDate",
      header: "From",
      cell: ({ row }) =>
        new Date(row.original.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      accessorKey: "endDate",
      header: "To",
      cell: ({ row }) =>
        new Date(row.original.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      accessorKey: "totalDays",
      header: "Days",
      cell: ({ row }) => `${row.original.totalDays} day${row.original.totalDays !== 1 ? "s" : ""}`,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="max-w-48 truncate block text-slate-500 dark:text-slate-400 text-sm">
          {row.original.reason || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const sid: number = row.original.statusId;
        const s = LEAVE_STATUS_MAP[sid] ?? { label: "Unknown", className: "bg-slate-100 text-slate-600" };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      accessorKey: "rejectionReason",
      header: "Rejection Reason",
      cell: ({ row }) =>
        row.original.statusId === 3 ? (
          <span className="max-w-48 truncate block text-red-500 text-sm">
            {row.original.rejectionReason || "—"}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="Apply and track your leave requests."
        action={
          <Button type="button" onClick={() => router.push("/leave/add")}>
            <Plus className="size-4 mr-1" />
            Apply Leave
          </Button>
        }
      />

      <div className="flex gap-4 sm:flex-row flex-col" id="leave-stats">
        <Card className="border border-stat-amber-ring bg-stat-amber-card flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-stat-amber-icon text-stat-amber-icon-fg">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-stat-amber-label font-medium uppercase tracking-wide">Pending Requests</p>
              <p className="text-2xl font-bold text-stat-amber-value">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-stat-green-ring bg-stat-green-card flex-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-stat-green-icon text-stat-green-icon-fg">
              <CalendarCheck2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-stat-green-label font-medium uppercase tracking-wide">Approved Days (visible)</p>
              <p className="text-2xl font-bold text-stat-green-value">{stats.approvedDays} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Filter>
        <LeaveFilterPanel draft={draft} setDraft={setDraft} onApply={handleApply} onReset={handleReset} />
      </Filter>

      <div className="flex gap-2 flex-wrap" id="leave-status-filter">
        {LEAVE_STATUS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { resetLimit(); updateFilters({ ...(filters as any), statusId: tab.value }); }}
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
        showExtraHeader={["leave-stats", "leave-status-filter", "pageHeading"]}
      />
    </div>
  );
};

export default LeavePage;
