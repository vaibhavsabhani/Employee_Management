import React from "react";
import DataTable from "@/components/common/DataTable";
import {
  useGetMyLeavesQuery,
  useCancelLeaveMutation,
} from "@/store/Action/leaveAction";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/components/sidebar.route";

export default function MyLeaves() {
  const { data, isLoading } = useGetMyLeavesQuery({ page: 1, limit: 20 });
  const [cancelLeave] = useCancelLeaveMutation();
  const navigate = useNavigate();

  const columns = [
    { header: "Leave Type", accessor: "leaveType" },
    {
      header: "Start Date",
      accessor: "startDate",
      render: (r) => new Date(r.startDate).toLocaleDateString(),
    },
    {
      header: "End Date",
      accessor: "endDate",
      render: (r) => new Date(r.endDate).toLocaleDateString(),
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
            <Button
              variant="ghost"
              onClick={async () => {
                if (confirm("Cancel?")) await cancelLeave(r._id);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Leave Requests</h2>
        <div>
          <Button onClick={() => navigate(ROUTES.APPLY_LEAVE)}>Apply Leave</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        page={data?.page || 1}
        limit={data?.limit || 10}
        total={data?.total || 0}
        totalPages={data?.totalPages || 1}
      />
    </Layout>
  );
}
