"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, UserX, Mail, Phone, MapPin, CreditCard, Fingerprint, CalendarDays, Search } from "lucide-react";

import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "@/src/store/action";
import { Toast } from "@/src/components/custom/Toast";
import { ConfirmDialog } from "@/src/components/custom/ConfirmDialog";
import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import Filter from "@/src/components/custom/filters";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/src/components/ui/dialog";

/* ── types ─────────────────────────────────────────────── */
type Employee = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt?: string;
  role?: { name: string };
};

/* ── helpers ─────────────────────────────────────────────── */
function initials(emp: Pick<Employee, "firstName" | "lastName">) {
  return [emp.firstName?.[0], emp.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

function Avatar({ emp, size = "md" }: { emp: Pick<Employee, "firstName" | "lastName" | "profilePicture">; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-16 text-2xl" : "size-10 text-sm";
  const ini = initials(emp);
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold shrink-0`}>
      {emp.profilePicture ? (
        <img src={emp.profilePicture} alt={ini} className="size-full object-cover" />
      ) : (
        ini
      )}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/60 last:border-0">
      <div className="mt-0.5 p-1.5 rounded-md bg-muted">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground mt-0.5 break-all">
          {value || <span className="text-muted-foreground/60 italic">—</span>}
        </p>
      </div>
    </div>
  );
}

/* ── status tabs ─────────────────────────────────────────── */
const STATUS_TABS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
  { label: "All", value: "all" },
];

/* ── filter panel ────────────────────────────────────────── */
type DraftFilters = { search: string; email: string; isActive: string };
const defaultDraft: DraftFilters = { search: "", email: "", isActive: "true" };

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
    {/* Name search */}
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">Search by Name</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="First or last name…"
          value={draft.search}
          onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
          className="pl-9"
        />
      </div>
    </div>

    {/* Email search */}
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-semibold mb-1.5">Search by Email</label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Email address…"
          value={draft.email}
          onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
          className="pl-9"
        />
      </div>
    </div>

    {/* Status toggle */}
    <div className="shrink-0">
      <label className="block text-sm font-semibold mb-1.5">Status</label>
      <div className="flex rounded-md overflow-hidden border border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setDraft((p) => ({ ...p, isActive: tab.value }))}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              draft.isActive === tab.value
                ? "bg-sidebar-primary text-white"
                : "bg-background text-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>

    {/* Buttons */}
    <div className="flex gap-3 shrink-0 xl:pb-0 pb-1">
      <Button
        type="button"
        onClick={onApply}
        className="h-10 px-6 bg-sidebar-primary hover:bg-violet-700 text-white"
      >
        Apply Filter
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="h-10 px-6"
      >
        Reset
      </Button>
    </div>
  </div>
);

/* ── page ─────────────────────────────────────────────────── */
const defaultEmployeeFilters = { search: "", email: "", isActive: "true" };

const EmployeePage = () => {
  const router = useRouter();
  const [getEmployees] = useLazyGetEmployeesQuery();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [draft, setDraft] = useState<DraftFilters>(defaultDraft);

  /* ── pagination ── */
  const fetchEmployeeData = useCallback(
    ({ page, limit, ...filters }: any) =>
      getEmployees({ page, limit, filters }).unwrap(),
    [getEmployees],
  );

  const transformEmployeeResponse = useCallback(
    (res: any) => ({ data: res?.users || [], total: res?.total || 0 }),
    [],
  );

  const {
    data, loading, page, nextPage, prevPage,
    canNext, canPrev, updateFilters, filters, totalPages,
    total, limit, setLimit, resetLimit, refetch,
  } = usePaginatedQuery(fetchEmployeeData, {
    defaultFilters: defaultEmployeeFilters,
    transformResponse: transformEmployeeResponse,
  });

  /* ── filter handlers ── */
  const handleApply = () => {
    resetLimit();
    updateFilters({ ...(filters as any), ...draft });
  };

  const handleReset = () => {
    setDraft(defaultDraft);
    resetLimit();
    updateFilters(defaultEmployeeFilters);
  };

  /* ── delete handler ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteEmployee(deleteTarget.id).unwrap();
      Toast(res, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    }
  };

  /* ── active status tabs (applied) ── */
  const activeIsActive = (filters as any)?.isActive ?? "true";

  /* ── columns ── */
  const employeeColumns: ColumnDef<any>[] = [
    {
      id: "name",
      header: "Employee",
      cell: ({ row }) => {
        const emp: Employee = row.original;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar emp={emp} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => row.original.phoneNumber ?? "—",
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.role?.name ?? "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      minSize: 210,
      cell: ({ row }) => {
        const emp: Employee = row.original;
        return (
          <div className="flex items-center gap-1.5 flex-nowrap">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs gap-1 shrink-0"
              onClick={() => setViewEmployee(emp)}
            >
              <Eye className="size-3" />
              View
            </Button>

            <Button
              size="sm"
              className="h-7 px-2.5 text-xs gap-1 shrink-0"
              onClick={() => router.push(`/employees/${emp.id}`)}
            >
              <Pencil className="size-3" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2.5 text-xs gap-1 shrink-0"
              onClick={() => setDeleteTarget(emp)}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage employees and their roles."
        action={
          <Button onClick={() => router.push("/employees/add")}>
            Add Employee
          </Button>
        }
      />

      {/* ── Filter Panel ────────────────────────────────── */}
      <Filter>
        <EmployeeFilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={handleApply}
          onReset={handleReset}
        />
      </Filter>

      {/* ── Quick status tabs ─────────────────────────── */}
      <div className="flex gap-2 flex-wrap" id="employee-status-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              const newDraft = { ...draft, isActive: tab.value };
              setDraft(newDraft);
              resetLimit();
              updateFilters({ ...(filters as any), ...newDraft });
            }}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeIsActive === tab.value
                ? "bg-sidebar-primary text-white border-sidebar-primary"
                : "bg-pill-bg text-pill-fg border-pill-ring hover:border-violet-400 hover:text-violet-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={employeeColumns}
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
        showExtraHeader={["employee-status-tabs", "pageHeading"]}
      />

      {/* ── View Dialog ─────────────────────────────────── */}
      <Dialog open={!!viewEmployee} onOpenChange={(o) => !o && setViewEmployee(null)}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">

          {/* Coloured header */}
          <div className="bg-linear-to-br from-violet-600 to-violet-800 px-6 pt-8 pb-12 flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full ring-4 ring-white/30 overflow-hidden">
              {viewEmployee?.profilePicture ? (
                <img src={viewEmployee.profilePicture} alt={initials(viewEmployee)} className="size-full object-cover" />
              ) : (
                <div className="size-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                  {viewEmployee ? initials(viewEmployee) : ""}
                </div>
              )}
            </div>
            <div className="text-center">
              <DialogTitle className="text-lg font-bold text-white">
                {[viewEmployee?.firstName, viewEmployee?.middleName, viewEmployee?.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </DialogTitle>
              <p className="text-sm text-white/70 mt-0.5 capitalize">
                {viewEmployee?.role?.name ?? "Employee"}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  viewEmployee?.isActive
                    ? "bg-green-400/20 text-green-100 ring-1 ring-green-300/40"
                    : "bg-red-400/20 text-red-100 ring-1 ring-red-300/40"
                }`}
              >
                {viewEmployee?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Details card pulled up */}
          <div className="-mt-6 rounded-t-3xl bg-popover px-6 pt-5 pb-2">
            <DetailRow icon={Mail}        label="Email"          value={viewEmployee?.email} />
            <DetailRow icon={Phone}       label="Phone Number"   value={viewEmployee?.phoneNumber} />
            <DetailRow icon={CreditCard}  label="PAN Number"     value={viewEmployee?.panNumber} />
            <DetailRow icon={Fingerprint} label="Aadhaar Number" value={viewEmployee?.aadhaarNumber} />
            <DetailRow icon={MapPin}      label="Address"        value={viewEmployee?.address} />
            <DetailRow
              icon={CalendarDays}
              label="Joined"
              value={
                viewEmployee?.createdAt
                  ? new Date(viewEmployee.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : undefined
              }
            />
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewEmployee(null)}
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                router.push(`/employees/${viewEmployee?.id}`);
                setViewEmployee(null);
              }}
            >
              <Pencil className="size-3" />
              Edit Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Deactivate Employee?"
        description={`${deleteTarget ? [deleteTarget.firstName, deleteTarget.lastName].join(" ") : "This employee"} will lose access to the portal immediately. You can reactivate them later from the edit page.`}
        icon={<UserX className="size-5" />}
        confirmLabel={isDeleting ? "Deactivating…" : "Yes, Deactivate"}
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EmployeePage;
