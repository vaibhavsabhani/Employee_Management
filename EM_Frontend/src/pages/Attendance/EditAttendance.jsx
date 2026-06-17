import React, { useEffect, useState } from "react";
import {
  useGetAttendanceQuery,
  useUpdateAttendanceMutation,
} from "@/store/Action/attendanceAction";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "Present",
  "Absent",
  "Half Day",
  "Work From Home",
  "Paid Leave",
  "Unpaid Leave",
];

export default function EditAttendance() {
  const { id } = useParams();
  const { data } = useGetAttendanceQuery({ page: 1, limit: 1 });
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [form, setForm] = useState({ status: "", remarks: "" });

  useEffect(() => {
    // naive: find in list
    const item = (data?.data || []).find((it) => it._id === id);
    if (item) setForm({ status: item.status, remarks: item.remarks || "" });
  }, [data, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateAttendance({ id, ...form }).unwrap();
    alert("Updated");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <label>Status</label>
      <select
        className="w-full p-2 border rounded"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label>Remarks</label>
      <Input
        value={form.remarks}
        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
      />

      <div>
        <Button type="submit">Update</Button>
      </div>
    </form>
  );
}
