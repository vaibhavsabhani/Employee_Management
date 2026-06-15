import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import usePaginatedQuery from "@/hooks/usePagination";
import {
  useDeleteEmployeeMutation,
  useLazyGetEmployeesQuery,
} from "@/store/action";
import { Download, Plus } from "lucide-react";
import React, { useCallback } from "react";
import DataTable from "@/components/common/DataTable";
import { Routes, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DeleteIcon, EditIcon, ViewIcon } from "@/utils/icons";
import Block from "@/components/custom/Block";
import { toast } from "sonner";
import { ROUTES } from "@/components/sidebar.route";

const Employees = () => {
  const navigate = useNavigate();

  const [getEmployee, { isFetching }] = useLazyGetEmployeesQuery();
  const [deleteEmployee, { isLoading: deleteEmployeeLoader }] =
    useDeleteEmployeeMutation();

  const fetchData = useCallback(
    ({ page, limit, ...filters }) => {
      return getEmployee({ page, limit, filters }).unwrap();
    },
    [getEmployee],
  );

  const transformResponse = useCallback((res) => {
    return {
      data: res?.users || res?.data || [],
      total: res?.total || 0,
      page: res?.page || 1,
      limit: res?.limit || 10,
      totalPages:
        res?.totalPages || Math.ceil((res?.total || 0) / (res?.limit || 10)),
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
    setPage,
  } = usePaginatedQuery(fetchData, {
    defaultFilters: {},
    transformResponse,
  });

  const handleDelete = (userId) => () => {
    console.log("Delete user with ID:", userId);
    deleteEmployee(userId).then((res) => {
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to delete employee");
      } else {
        toast.success("Employee deleted successfully");
        refetch();
      }
    });
  };

  const employeeColumns = [
    {
      header: "Name",
      key: "name",
      render: (row) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10" size="sm">
              <AvatarFallback>
                {(row.firstName || row.email || "U")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>
              {row.firstName} {row.lastName}
            </span>
          </div>
        );
      },
    },

    {
      header: "Role",
      accessor: "role",
    },

    {
      header: "Email",
      accessor: "email",
    },

    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <Block className="flex items-center gap-2">
          <ViewIcon
            onClick={() =>
              navigate(ROUTES.EMPLOYEE_PROFILE.replace(":id", row.userId))
            }
            width={18}
            height={18}
            className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
          />
          <EditIcon
            className="cursor-pointer"
            width={18}
            height={18}
            onClick={() =>
              navigate(ROUTES.EMPLOYEE_EDIT.replace(":id", row.userId))
            }
          />
          <DeleteIcon
            width={18}
            height={18}
            onClick={handleDelete(row.userId)}
            className="cursor-pointer"
          />
        </Block>
      ),
    },
  ];
  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500">
            Manage {total} staff members across all departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => navigate(ROUTES.EMPLOYEE_ADD)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <DataTable
          columns={employeeColumns}
          data={data}
          loading={deleteEmployeeLoader || isFetching}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => setLimit(l)}
        />
      </div>
    </Layout>
  );
};

export default Employees;
