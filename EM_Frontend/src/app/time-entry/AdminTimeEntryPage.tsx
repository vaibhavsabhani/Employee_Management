"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/custom/ConfirmDialog";
import { Textarea } from "@/src/components/ui/textarea";
import Filter from "@/src/components/custom/filters";
import DateInput from "@/src/components/custom/DateInput";
import { NotesCell } from "@/src/components/custom/NotesCell";
import { STATUS_MAP, TIME_ENTRY_STATUS } from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetTimeEntriesQuery,
  useUpdateTimeEntryStatusMutation,
} from "@/src/store/action/time-entry/timeEntry";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/src/components/ui/input";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useTimeEntrySocket } from "@/src/hooks/useTimeEntrySocket";

const fmtMins = (mins: number) => `${(mins / 60).toFixed(1)}h`;

type DraftFilters = {
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
};

const defaultFilters = {
  statusId: "",
  employeeName: "",
  employeeEmail: "",
  startDate: "",
  endDate: "",
};

const AdminFilterPanel = ({
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
      <label className="block text-sm font-semibold mb-1.5">Employee Name</label>
      <Input
        placeholder="Search by name..."
        value={draft.employeeName}
        onChange={(e) => setDraft((prev) => ({ ...prev, employeeName: e.target.value }))}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">Employee Email</label>
      <Input
        placeholder="Search by email..."
        value={draft.employeeEmail}
        onChange={(e) => setDraft((prev) => ({ ...prev, employeeEmail: e.target.value }))}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">From Date</label>
      <DateInput
        value={draft.startDate}
        onChange={(date) => setDraft((prev) => ({ ...prev, startDate: date ?? "" }))}
        maxDate={draft.endDate ? new Date(draft.endDate) : undefined}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">To Date</label>
      <DateInput
        value={draft.endDate}
        onChange={(date) => setDraft((prev) => ({ ...prev, endDate: date ?? "" }))}
        minDate={draft.startDate ? new Date(draft.startDate) : undefined}
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

const AdminTimeEntryPage = () => {
  const [getTimeEntries] = useLazyGetTimeEntriesQuery();
  const [updateStatus] = useUpdateTimeEntryStatusMutation();

  // per-row loading: tracks which entryId is being actioned
  const [rowLoading, setRowLoading] = useState<Record<string, "approve" | "reject" | null>>({});
  const [isRejecting, setIsRejecting] = useState(false);

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    entryId: string | null;
  }>({ open: false, entryId: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [draft, setDraft] = useState<DraftFilters>({
    employeeName: "",
    employeeEmail: "",
    startDate: "",
    endDate: "",
  });

  const fetchEntries = useCallback(
    async ({ page, limit, ...filters }: any) => {
      return getTimeEntries({ page, limit, ...filters }).unwrap();
    },
    [getTimeEntries],
  );

  const transformResponse = useCallback(
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
  } = usePaginatedQuery(fetchEntries, {
    defaultFilters,
    transformResponse,
  });

  // auto-refresh when an employee submits/resubmits or clocks out (auto-approved)
  useTimeEntrySocket((type) => {
    if (
      type === "time_entry_submitted" ||
      type === "time_entry_resubmitted" ||
      type === "time_entry_clock_out"
    ) {
      refetch();
    }
  });

  const activeStatus = (filters as any)?.statusId ?? "";

  const handleApplyFilter = () => {
    resetLimit();
    updateFilters({ ...(filters as any), ...draft });
  };

  const handleResetFilter = () => {
    setDraft({ employeeName: "", employeeEmail: "", startDate: "", endDate: "" });
    resetLimit();
    updateFilters(defaultFilters);
  };

  const handleApprove = async (id: string) => {
    setRowLoading((prev) => ({ ...prev, [id]: "approve" }));
    try {
      const res = await updateStatus({ id, statusId: 2 }).unwrap();
      Toast(res);
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    } finally {
      setRowLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectionReason("");
    setRejectDialog({ open: true, entryId: id });
  };

  const handleReject = async () => {
    if (!rejectDialog.entryId) return;
    const id = rejectDialog.entryId;
    setIsRejecting(true);
    setRowLoading((prev) => ({ ...prev, [id]: "reject" }));
    try {
      const res = await updateStatus({
        id,
        statusId: 3,
        rejectionReason: rejectionReason.trim() || undefined,
      }).unwrap();
      Toast(res);
      setRejectDialog({ open: false, entryId: null });
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    } finally {
      setIsRejecting(false);
      setRowLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const e = row.original.employee;
        return e ? (
          <div>
            <p className="font-medium text-sm">
              {e.firstName} {e.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{e.email}</p>
          </div>
        ) : (
          "—"
        );
      },
    },
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
    { accessorKey: "startTime", header: "Start" },
    {
      accessorKey: "endTime",
      header: "End",
      cell: ({ row }) =>
        row.original.endTime ?? (
          <span className="text-xs text-amber-500 dark:text-amber-400">
            In progress
          </span>
        ),
    },
    {
      accessorKey: "breakDuration",
      header: "Break",
      cell: ({ row }) => `${row.original.breakDuration ?? 0} min`,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => fmtMins(row.original.duration ?? 0),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      size: 280,
      cell: ({ row }) => {
        const e = row.original.employee;
        const name = e ? `${e.firstName} ${e.lastName}` : undefined;
        const date = new Date(row.original.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return (
          <NotesCell
            notes={row.original.notes}
            subtitle={[name, date].filter(Boolean).join(" · ")}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const sid: number = row.original.statusId;
        const s = STATUS_MAP[sid] ?? {
          label: "Unknown",
          className: "bg-badge-neutral text-badge-neutral-fg",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      minSize: 200,
      cell: ({ row }) => {
        const sid: number = row.original.statusId;
        const id: string = row.original.id;
        const rowState = rowLoading[id];

        // Rejected entries are awaiting the employee's resubmission.
        if (sid === 3)
          return (
            <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
          );

        // In-progress entries (clocked in, not yet clocked out) can't be
        // actioned — they auto-finalise on clock-out.
        if (!row.original.endTime)
          return (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Awaiting clock-out
            </span>
          );

        const approveBtn = (
          <Button
            size="sm"
            variant="outline"
            disabled={!!rowState}
            className="h-7 px-2.5 text-xs border-btn-approve-ring text-btn-approve-fg hover:bg-btn-approve-hover shrink-0"
            onClick={() => handleApprove(id)}
          >
            {rowState === "approve" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5 mr-1" />
            )}
            {rowState === "approve" ? "Approving…" : "Approve"}
          </Button>
        );

        const rejectBtn = (
          <Button
            size="sm"
            variant="outline"
            disabled={!!rowState}
            className="h-7 px-2.5 text-xs border-btn-reject-ring text-btn-reject-fg hover:bg-btn-reject-hover shrink-0"
            onClick={() => openRejectDialog(id)}
          >
            {rowState === "reject" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <XCircle className="size-3.5 mr-1" />
            )}
            {rowState === "reject" ? "Rejecting…" : "Reject"}
          </Button>
        );

        return (
          <div className="flex items-center gap-2 flex-nowrap">
            {/* Pending → can approve or reject; Approved → can still reject */}
            {sid === 1 && approveBtn}
            {rejectBtn}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Entry Management"
        description="Review and approve employee time entries."
      />

      {/* Date filter — responsive via Filter component */}
      <Filter>
        <AdminFilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
      </Filter>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap" id="admin-status-filter">
        {TIME_ENTRY_STATUS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              resetLimit();
              updateFilters({ ...(filters as any), statusId: tab.value });
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
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
        showExtraHeader={["admin-status-filter", "pageHeading"]}
      />

      <ConfirmDialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, entryId: open ? rejectDialog.entryId : null })
        }
        title="Reject Time Entry?"
        description="This action will mark the entry as Rejected. The employee will be notified. You can optionally provide a reason below."
        icon={<AlertTriangle className="size-5" />}
        confirmLabel={isRejecting ? "Rejecting..." : "Yes, Reject"}
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isRejecting}
        onConfirm={handleReject}
      >
        <Textarea
          placeholder="Reason for rejection (optional)..."
          rows={3}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="resize-none"
        />
      </ConfirmDialog>
    </div>
  );
};

export default AdminTimeEntryPage;
