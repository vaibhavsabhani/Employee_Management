"use client";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import Filter from "@/src/components/custom/filters";
import { Input } from "@/src/components/ui/input";
import {
  ATTENDANCE_STATUS_FILTER,
  ATTENDANCE_STATUS_MAP,
  LEAVE_TYPE_MAP,
} from "@/src/constant/constant";
import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetAttendanceQuery,
  useMarkAttendanceMutation,
} from "@/src/store/action/attendance/attendance";
import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plane,
  UserCheck,
  Users,
  UserX,
  CircleDashed,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STAT_COLORS: Record<string, { card: string; icon: string; label: string; value: string }> = {
  slate: {
    card:  "border border-stat-slate-ring bg-stat-slate-card",
    icon:  "bg-stat-slate-icon text-stat-slate-icon-fg",
    label: "text-stat-slate-label",
    value: "text-stat-slate-value",
  },
  green: {
    card:  "border border-stat-green-ring bg-stat-green-card",
    icon:  "bg-stat-green-icon text-stat-green-icon-fg",
    label: "text-stat-green-label",
    value: "text-stat-green-value",
  },
  blue: {
    card:  "border border-stat-blue-ring bg-stat-blue-card",
    icon:  "bg-stat-blue-icon text-stat-blue-icon-fg",
    label: "text-stat-blue-label",
    value: "text-stat-blue-value",
  },
  red: {
    card:  "border border-stat-red-ring bg-stat-red-card",
    icon:  "bg-stat-red-icon text-stat-red-icon-fg",
    label: "text-stat-red-label",
    value: "text-stat-red-value",
  },
  amber: {
    card:  "border border-stat-amber-ring bg-stat-amber-card",
    icon:  "bg-stat-amber-icon text-stat-amber-icon-fg",
    label: "text-stat-amber-label",
    value: "text-stat-amber-value",
  },
};

type AttendanceStats = {
  total: number;
  present: number;
  onLeave: number;
  absent: number;
  notMarked: number;
};

type DraftFilters = { employeeName: string; employeeEmail: string };

function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return localDateStr(date);
}

const EmployeeFilterPanel = ({
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
        onChange={(e) => setDraft((p) => ({ ...p, employeeName: e.target.value }))}
      />
    </div>
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">Employee Email</label>
      <Input
        placeholder="Search by email..."
        value={draft.employeeEmail}
        onChange={(e) => setDraft((p) => ({ ...p, employeeEmail: e.target.value }))}
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

const AttendancePage = () => {
  const today = localDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0, present: 0, onLeave: 0, absent: 0, notMarked: 0,
  });
  const [draft, setDraft] = useState<DraftFilters>({ employeeName: "", employeeEmail: "" });
  const [markingId, setMarkingId] = useState<string | null>(null);

  const [getAttendance] = useLazyGetAttendanceQuery();
  const [markAttendance] = useMarkAttendanceMutation();

  const defaultFilters = { date: today, statusFilter: "", employeeName: "", employeeEmail: "" };

  const fetchAttendance = useCallback(
    async ({ page, limit, ...filters }: any) => {
      const res = await getAttendance({ page, limit, ...filters }).unwrap();
      if (res?.stats) setStats(res.stats);
      return res;
    },
    [getAttendance],
  );

  const transformResponse = useCallback(
    (res: any) => ({ data: res?.data || [], total: res?.total || 0 }),
    [],
  );

  const {
    data, loading, page, nextPage, prevPage, canNext, canPrev,
    updateFilters, filters, totalPages, total, limit, setLimit, resetLimit, refetch,
  } = usePaginatedQuery(fetchAttendance, { defaultFilters, transformResponse });

  const activeStatus = (filters as any)?.statusFilter ?? "";

  useEffect(() => {
    updateFilters({ date: selectedDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleApplyFilter = () => {
    resetLimit();
    updateFilters({ ...draft });
  };

  const handleResetFilter = () => {
    setDraft({ employeeName: "", employeeEmail: "" });
    resetLimit();
    updateFilters({ employeeName: "", employeeEmail: "" });
  };

  const handleMark = async (employeeId: string, statusId: number) => {
    setMarkingId(`${employeeId}-${statusId}`);
    try {
      const res = await markAttendance({ employeeId, date: selectedDate, statusId }).unwrap();
      Toast(res);
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    } finally {
      setMarkingId(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const e = row.original.employee;
        return (
          <div>
            <p className="font-medium text-sm">{e.firstName} {e.lastName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{e.email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "effectiveStatus",
      header: "Status",
      cell: ({ row }) => {
        const s = ATTENDANCE_STATUS_MAP[row.original.effectiveStatus] ?? {
          label: "Unknown",
          className: "bg-slate-100 text-slate-600",
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      accessorKey: "leave",
      header: "Leave Type",
      cell: ({ row }) => {
        if (row.original.effectiveStatus !== "on-leave" || !row.original.leave) {
          return <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>;
        }
        const id: number = row.original.leave.leaveTypeId;
        const t = LEAVE_TYPE_MAP[id];
        return t ? (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.className}`}>
            {t.label}
          </span>
        ) : row.original.leave.leaveType?.name ?? "—";
      },
    },
    {
      accessorKey: "markedBy",
      header: "Marked By",
      cell: ({ row }) => {
        const mb = row.original.attendance?.markedBy;
        return mb ? (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {mb.firstName} {mb.lastName}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Mark Attendance",
      cell: ({ row }) => {
        const status = row.original.effectiveStatus;
        const empId: string = row.original.employee.id;

        if (status === "on-leave") {
          return <span className="text-xs text-slate-400 dark:text-slate-500 italic">Auto-marked (On Leave)</span>;
        }

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!!markingId}
              onClick={() => handleMark(empId, 1)}
              className={`h-7 px-3 text-xs gap-1 transition-all ${
                status === "present"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border border-btn-approve-ring text-btn-approve-fg hover:bg-btn-approve-hover bg-transparent"
              }`}
              variant={status === "present" ? "default" : "outline"}
            >
              <UserCheck className="size-3" />
              Present
            </Button>
            <Button
              size="sm"
              disabled={!!markingId}
              onClick={() => handleMark(empId, 2)}
              className={`h-7 px-3 text-xs gap-1 transition-all ${
                status === "absent"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "border border-btn-reject-ring text-btn-reject-fg hover:bg-btn-reject-hover bg-transparent"
              }`}
              variant={status === "absent" ? "default" : "outline"}
            >
              <UserX className="size-3" />
              Absent
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Manually mark employee attendance. Employees on approved leave are auto-marked."
      />

      {/* Date navigation */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {formatDisplayDate(selectedDate)}
              </p>
              {selectedDate === today && (
                <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">Today</span>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={selectedDate >= today}
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CalendarDays className="size-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {selectedDate !== today && (
            <Button variant="outline" size="sm" className="shrink-0 h-9" onClick={() => setSelectedDate(today)}>
              Go to Today
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" id="attendance-stats">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "slate" },
          { label: "Present", value: stats.present, icon: UserCheck, color: "green" },
          { label: "On Leave", value: stats.onLeave, icon: Plane, color: "blue" },
          { label: "Absent", value: stats.absent, icon: UserX, color: "red" },
          { label: "Not Marked", value: stats.notMarked, icon: CircleDashed, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => {
          const c = STAT_COLORS[color];
          return (
            <Card key={label} className={c.card}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${c.icon}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wide ${c.label}`}>{label}</p>
                  <p className={`text-xl font-bold ${c.value}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Employee filter */}
      <Filter>
        <EmployeeFilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
      </Filter>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap" id="attendance-status-filter">
        {ATTENDANCE_STATUS_FILTER.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { resetLimit(); updateFilters({ statusFilter: tab.value }); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeStatus === tab.value
                ? "bg-sidebar-primary text-white border-sidebar-primary"
                : "bg-pill-bg text-pill-fg border-pill-ring hover:border-violet-400 hover:text-violet-700"
            }`}
          >
            {tab.label}
            {tab.value === "not-marked" && stats.notMarked > 0 && (
              <span className="ml-1.5 text-xs bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                {stats.notMarked}
              </span>
            )}
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
        showExtraHeader={["attendance-stats", "attendance-status-filter", "pageHeading"]}
      />
    </div>
  );
};

export default AttendancePage;
