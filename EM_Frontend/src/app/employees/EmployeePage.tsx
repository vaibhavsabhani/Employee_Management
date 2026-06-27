"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Pencil,
  Trash2,
  UserX,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Fingerprint,
  CalendarDays,
  Search,
  UserCheck,
} from "lucide-react";

import usePaginatedQuery from "@/src/hooks/usePagination";
import {
  useLazyGetEmployeesQuery,
  useDeleteEmployeeMutation,
  useEditEmployeeMutation,
} from "@/src/store/action";
import { Toast } from "@/src/components/custom/Toast";
import { ConfirmDialog } from "@/src/components/custom/ConfirmDialog";
import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import Filter from "@/src/components/custom/filters";
import { Button } from "@/src/components/ui/button";
import { useRole } from "@/src/hooks/useRole";
import { ROLES } from "@/src/constant/role";
import EmployeeFilter, { DraftFilters } from "./EmployeeFilter";
import { FilterTabs } from "@/src/components/custom/FilterTabs";
import { ViewDetailsDialog } from "@/src/components/custom/ViewDetailsDialog";
import { employeeDialogConfig } from "./employeeConfig";
import { initials } from "@/src/lib/utils";

/* ── types ─────────────────────────────────────────────── */
export type Employee = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  countryCode?: string;
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

function Avatar({
  emp,
  size = "md",
}: {
  emp: Pick<Employee, "firstName" | "lastName" | "profilePicture">;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "size-8 text-xs"
      : size === "lg"
        ? "size-16 text-2xl"
        : "size-10 text-sm";
  const ini = initials(emp);
  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold shrink-0`}
    >
      {emp.profilePicture ? (
        <img
          src={emp.profilePicture}
          alt={ini}
          className="size-full object-cover"
        />
      ) : (
        ini
      )}
    </div>
  );
}

/* ── status tabs ─────────────────────────────────────────── */
const STATUS_TABS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
  { label: "All", value: "all" },
];

const EmployeePage = () => {
  const router = useRouter();
  const role = useRole();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const [getEmployees] = useLazyGetEmployeesQuery();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();
  const [editEmployee, { isLoading: isReactivating }] =
    useEditEmployeeMutation();

  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<Employee | null>(
    null,
  );
  const defaultEmployeeFilters = {
    search: "",
    email: "",
    isActive: "true",
    role: isSuperAdmin ? "" : ROLES.EMPLOYEE,
  };

  const [draft, setDraft] = useState<DraftFilters>(defaultEmployeeFilters);

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
  } = usePaginatedQuery(fetchEmployeeData, {
    defaultFilters: defaultEmployeeFilters,
    transformResponse: transformEmployeeResponse,
  });

  const handleApply = () => {
    resetLimit();
    updateFilters({ ...(filters as any), ...draft });
  };

  const handleReset = () => {
    setDraft(defaultEmployeeFilters);
    resetLimit();
    updateFilters(defaultEmployeeFilters);
  };

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

  const handleReactivate = async () => {
    if (!reactivateTarget) return;
    try {
      const res = await editEmployee({
        employeeId: reactivateTarget.id,
        body: { isActive: true },
      }).unwrap();
      Toast(res, "success");
      setReactivateTarget(null);
      refetch();
    } catch (err: any) {
      Toast({ error: err }, "error");
    }
  };

  const activeIsActive = (filters as any)?.isActive ?? "true";

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
              <p className="text-sm font-medium truncate">
                {emp.firstName} {emp.lastName}
              </p>
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
      minSize: 220,
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

            {emp.isActive ? (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 px-2.5 text-xs gap-1 shrink-0"
                onClick={() => setDeleteTarget(emp)}
              >
                <Trash2 className="size-3" />
                Delete
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs gap-1 shrink-0 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => setReactivateTarget(emp)}
              >
                <UserCheck className="size-3" />
                Reactivate
              </Button>
            )}
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

      <Filter>
        <EmployeeFilter
          draft={draft}
          setDraft={setDraft}
          onApply={handleApply}
          onReset={handleReset}
        />
      </Filter>

      <div className="flex gap-2 flex-wrap">
        <FilterTabs
          tabs={STATUS_TABS}
          activeValue={activeIsActive}
          onChange={(value) => {
            const newDraft = { ...draft, isActive: value };
            setDraft(newDraft);
            resetLimit();
            updateFilters({ ...(filters as any), ...newDraft });
          }}
        />
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
        showExtraHeader={["employee-status-tabs", "pageHeading", "FilterTabs"]}
      />

      <ViewDetailsDialog
        open={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        config={
          employeeDialogConfig(viewEmployee) ?? {
            initials: "",
            title: "",
            fields: [],
          }
        }
        editLabel="Edit Employee"
        onEdit={() => {
          router.push(`/employees/${viewEmployee?.id}`);
          setViewEmployee(null);
        }}
      />

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

      {/* ── Reactivate Confirm Dialog ────────────────────── */}
      <ConfirmDialog
        open={!!reactivateTarget}
        onOpenChange={(o) => !o && setReactivateTarget(null)}
        title="Reactivate Employee?"
        description={`${reactivateTarget ? [reactivateTarget.firstName, reactivateTarget.lastName].join(" ") : "This employee"} will regain access to the portal immediately.`}
        icon={<UserCheck className="size-5" />}
        confirmLabel={isReactivating ? "Reactivating…" : "Yes, Reactivate"}
        cancelLabel="Cancel"
        isLoading={isReactivating}
        onConfirm={handleReactivate}
      />
    </div>
  );
};

export default EmployeePage;
