"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import { ConfirmDialog } from "@/src/components/custom/ConfirmDialog";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import Filter from "@/src/components/custom/filters";
import DateInput from "@/src/components/custom/DateInput";
import {
  LEAVE_STATUS,
  LEAVE_STATUS_MAP,
  LEAVE_TYPE_MAP,
  LEAVE_TYPE_OPTIONS,
} from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetLeavesQuery,
  useUpdateLeaveStatusMutation,
} from "@/src/store/action/leave/leave";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

type DraftFilters = {
  employeeName: string;
  employeeEmail: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
};

const defaultFilters = {
  statusId: "",
  employeeName: "",
  employeeEmail: "",
  leaveTypeId: "",
  startDate: "",
  endDate: "",
};

const AdminLeaveFilterPanel = ({
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

const AdminLeavePage = () => {
  const [getLeaves] = useLazyGetLeavesQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateLeaveStatusMutation();

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; leaveId: string | null }>({
    open: false,
    leaveId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [draft, setDraft] = useState<DraftFilters>({
    employeeName: "",
    employeeEmail: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
  });

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

  const activeStatus = (filters as any)?.statusId ?? "";

  const handleApply = () => { resetLimit(); updateFilters({ ...(filters as any), ...draft }); };
  const handleReset = () => {
    setDraft({ employeeName: "", employeeEmail: "", leaveTypeId: "", startDate: "", endDate: "" });
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
    setRejectDialog({ open: true, leaveId: id });
  };

  const handleReject = async () => {
    if (!rejectDialog.leaveId) return;
    try {
      const res = await updateStatus({
        id: rejectDialog.leaveId,
        statusId: 3,
        rejectionReason: rejectionReason.trim() || undefined,
      }).unwrap();
      Toast(res);
      setRejectDialog({ open: false, leaveId: null });
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
            <p className="font-medium text-sm">{e.firstName} {e.lastName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{e.email}</p>
          </div>
        ) : "—";
      },
    },
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
        <span className="max-w-40 truncate block text-slate-500 dark:text-slate-400 text-sm">
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
        title="Leave Management"
        description="Review and approve employee leave requests."
      />

      <Filter>
        <AdminLeaveFilterPanel draft={draft} setDraft={setDraft} onApply={handleApply} onReset={handleReset} />
      </Filter>

      <div className="flex gap-2 flex-wrap" id="admin-leave-status-filter">
        {LEAVE_STATUS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { resetLimit(); updateFilters({ ...(filters as any), statusId: tab.value }); }}
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
        showExtraHeader={["admin-leave-status-filter", "pageHeading"]}
      />

      <ConfirmDialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          setRejectDialog({ open, leaveId: open ? rejectDialog.leaveId : null })
        }
        title="Reject Leave Request?"
        description="This will mark the leave as Rejected. You can optionally provide a reason below."
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

export default AdminLeavePage;
