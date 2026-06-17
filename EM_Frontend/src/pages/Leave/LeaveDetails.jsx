import React from "react";
import { useGetLeaveByIdQuery } from "@/store/Action/leaveAction";
import { useParams } from "react-router-dom";

export default function LeaveDetails() {
  const { id } = useParams();
  const { data } = useGetLeaveByIdQuery(id);
  const lr = data?.data;
  if (!lr) return <div>Not found</div>;
  return (
    <div className="bg-white p-4 rounded">
      <h3 className="text-lg font-semibold">Leave Details</h3>
      <div className="mt-2 space-y-2">
        <div>
          <strong>Employee:</strong> {lr.employee?.firstName}{" "}
          {lr.employee?.lastName}
        </div>
        <div>
          <strong>Type:</strong> {lr.leaveType}
        </div>
        <div>
          <strong>Range:</strong> {new Date(lr.startDate).toLocaleDateString()}{" "}
          - {new Date(lr.endDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Total Days:</strong> {lr.totalDays}
        </div>
        <div>
          <strong>Status:</strong> {lr.status}
        </div>
        <div>
          <strong>Reason:</strong> {lr.reason}
        </div>
        <div>
          <strong>Attachment:</strong>{" "}
          {lr.attachment ? (
            <a href={lr.attachment} target="_blank">
              View
            </a>
          ) : (
            "None"
          )}
        </div>
        <div>
          <strong>Admin Comment:</strong> {lr.adminComment || "-"}
        </div>
        <div>
          <strong>Rejection Reason:</strong> {lr.rejectionReason || "-"}
        </div>
      </div>
    </div>
  );
}
