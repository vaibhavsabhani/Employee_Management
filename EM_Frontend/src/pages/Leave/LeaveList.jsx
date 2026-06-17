import React, { useState } from "react";
import DataTable from "@/components/common/DataTable";
import {
  useAdminGetLeavesQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} from "@/store/Action/leaveAction";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function LeaveList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminGetLeavesQuery({ page, limit: 10 });
  const [approveLeave] = useApproveLeaveMutation();
  const [rejectLeave] = useRejectLeaveMutation();

  const columns = [
    {
      header: "Employee",
      accessor: "employee",
      render: (r) =>
        `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`,
    },
    { header: "Leave Type", accessor: "leaveType" },
    {
      header: "Range",
      accessor: "range",
      render: (r) =>
        `${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}`,
    },
    { header: "Total Days", accessor: "totalDays" },
    { header: "Status", accessor: "status" },
    {
      header: "Applied Date",
      accessor: "createdAt",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (r) => (
        <div className="flex gap-2">
          {r.status === "Pending" && (
            <>
              <Button
                onClick={async () => {
                  if (confirm("Approve?")) await approveLeave({ id: r._id });
                }}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const reason = prompt("Reason");
                  await rejectLeave({ id: r._id, rejectionReason: reason });
                }}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        page={data?.page || 1}
        limit={data?.limit || 10}
        total={data?.total || 0}
        totalPages={data?.totalPages || 1}
        onPageChange={(p) => setPage(p)}
      />
    </Layout>
  );
}
