"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import usePaginatedQuery from "@/src/hooks/usePagination";
import { useLazyGetEmployeesQuery } from "@/src/store/action";

import { DataTable } from "@/src/components/custom/DataTable";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Button } from "@/src/components/ui/button";

const defaultEmployeeFilters = {
  search: "",
};

const EmployeePage = () => {
  const router = useRouter();
  const [getEmployees] = useLazyGetEmployeesQuery();

  const fetchEmployeeData = useCallback(
    ({ page, limit, ...filters }) => {
      return getEmployees({
        page,
        limit,
        filters,
      }).unwrap();
    },
    [getEmployees],
  );

  const transformEmployeeResponse = useCallback((res: any) => {
    return {
      data: res?.users || [],
      total: res?.total || 0,
    };
  }, []);

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
    refetch,
    totalPages,
    total,
    limit,
    setLimit,
    resetLimit,
  } = usePaginatedQuery(fetchEmployeeData, {
    defaultFilters: defaultEmployeeFilters,
    transformResponse: transformEmployeeResponse,
  });
  console.log(data, "<<")
  const onApply = (appliedFilters: any) => {
    updateFilters(appliedFilters);
  };

  const onReset = () => {
    resetLimit();
    updateFilters(defaultEmployeeFilters);
  };

  const employeeColumns: ColumnDef<any>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => {
        return (
          <span>
            {row.original?.phoneNumber ?? "-"}
          </span>
        )
      }
    },
    {
      accessorKey: "role.name",
      header: "Role",
      cell: ({ row }) => {
        return (
          <span>
            {row.original?.role?.name ?? "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <button
              className="rounded border px-3 py-1"
              onClick={() => {
                console.log("View", row.original);
              }}
            >
              View
            </button>

            <button
              className="rounded border px-3 py-1"
              onClick={() => {
                router.push(`/employees/edit/${row.original.id}`);
              }}
            >
              Edit
            </button>
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
          <Button
            onClick={() => {
              router.push("/employees/add");
            }}
          >
            Add Employee
          </Button>
        }
      />

      <div className="w-full">
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
          showExtraHeader={["pageHeading"]}
        />
      </div>
    </div>
  );
};

export default EmployeePage;

