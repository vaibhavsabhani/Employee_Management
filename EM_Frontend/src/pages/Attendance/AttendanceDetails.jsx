import React from "react";
import { useGetAttendanceQuery } from "@/store/Action/attendanceAction";
import { useParams } from "react-router-dom";

export default function AttendanceDetails() {
  const { id } = useParams();
  const { data } = useGetAttendanceQuery({ page: 1, limit: 1000 });
  const item = (data?.data || []).find((i) => i._id === id);
  if (!item) return <div>No record</div>;
  return (
    <div className="bg-white p-4 rounded">
      <h3 className="text-lg font-semibold">Attendance Details</h3>
      <dl className="mt-2 space-y-2">
        <div>
          <strong>Employee:</strong> {item.employee?.firstName}{" "}
          {item.employee?.lastName}
        </div>
        <div>
          <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
        </div>
        <div>
          <strong>Status:</strong> {item.status}
        </div>
        <div>
          <strong>Remarks:</strong> {item.remarks}
        </div>
        <div>
          <strong>Marked By:</strong> {item.markedBy || "-"}
        </div>
      </dl>
    </div>
  );
}
