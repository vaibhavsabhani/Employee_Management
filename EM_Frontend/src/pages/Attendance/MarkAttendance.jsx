import React, { useState } from "react";
import { useGetEmployeesQuery } from "@/store/Action/Employee";
import { useCreateAttendanceMutation } from "@/store/Action/attendanceAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const STATUSES = [
  "Present",
  "Absent",
  "Half Day",
  "Work From Home",
  "Paid Leave",
  "Unpaid Leave",
];

export default function MarkAttendance() {
  const [employee, setEmployee] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState(STATUSES[0]);
  const [remarks, setRemarks] = useState("");

  const { data: employeesData } = useGetEmployeesQuery({ page: 1, limit: 100 });
  const [createAttendance, { isLoading }] = useCreateAttendanceMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !date) return alert("employee and date required");
    try {
      await createAttendance({
        employeeId: employee,
        date,
        status,
        remarks,
      }).unwrap();
      alert("Marked");
    } catch (e) {
      alert(e?.data?.message || e.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <label>Employee</label>
      <select
        className="w-full p-2 border rounded"
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
      >
        <option value="">Select employee</option>
        {(employeesData?.data || []).map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.firstName} {emp.lastName}
          </option>
        ))}
      </select>

      <label>Date</label>
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label>Status</label>
      <select
        className="w-full p-2 border rounded"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label>Remarks</label>
      <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />

      <div>
        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </div>
    </form>
  );
}
