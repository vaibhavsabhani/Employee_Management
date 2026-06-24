"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/custom/ConfirmDialog";
import { Textarea } from "@/src/components/ui/textarea";
import Filter from "@/src/components/custom/filters";
import DateInput from "@/src/components/custom/DateInput";
import { STATUS_MAP, TIME_ENTRY_STATUS } from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetTimeEntriesQuery,
  useUpdateTimeEntryStatusMutation,
} from "@/src/store/action/time-entry/timeEntry";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/src/components/ui/input";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";

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
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateTimeEntryStatusMutation();

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
    try {
      const res = await updateStatus({ id, statusId: 2 }).unwrap();
      Toast(res);
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectionReason("");
    setRejectDialog({ open: true, entryId: id });
  };

  const handleReject = async () => {
    if (!rejectDialog.entryId) return;
    try {
      const res = await updateStatus({
        id: rejectDialog.entryId,
        statusId: 3,
        rejectionReason: rejectionReason.trim() || undefined,
      }).unwrap();
      Toast(res);
      setRejectDialog({ open: false, entryId: null });
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
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
    { accessorKey: "endTime", header: "End" },
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
      cell: ({ row }) => (
        <span className="max-w-40 truncate block text-slate-500 dark:text-slate-400 text-sm">
          {row.original.notes || "—"}
        </span>
      ),
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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sid: number = row.original.statusId;
        if (sid !== 1) return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs border-btn-approve-ring text-btn-approve-fg hover:bg-btn-approve-hover"
              onClick={() => handleApprove(row.original.id)}
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs border-btn-reject-ring text-btn-reject-fg hover:bg-btn-reject-hover"
              onClick={() => openRejectDialog(row.original.id)}
            >
              <XCircle className="size-3.5 mr-1" />
              Reject
            </Button>
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
        confirmLabel={isUpdating ? "Rejecting..." : "Yes, Reject"}
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isUpdating}
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
