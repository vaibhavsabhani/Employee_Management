import React, { useState } from "react";
import { useApplyLeaveMutation } from "@/store/Action/leaveAction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Work From Home",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
];

export default function ApplyLeave() {
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("Start and end required");
    if (new Date(endDate) < new Date(startDate))
      return alert("End must be after start");
    try {
      await applyLeave({ leaveType, startDate, endDate, reason }).unwrap();
      alert("Applied");
    } catch (e) {
      alert(e?.data?.message || e.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <label>Leave Type</label>
      <select
        className="w-full p-2 border rounded"
        value={leaveType}
        onChange={(e) => setLeaveType(e.target.value)}
      >
        {LEAVE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label>Start Date</label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>End Date</label>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <label>Reason</label>
      <Input value={reason} onChange={(e) => setReason(e.target.value)} />

      <div>
        <Button type="submit" disabled={isLoading}>
          Apply
        </Button>
      </div>
    </form>
  );
}
