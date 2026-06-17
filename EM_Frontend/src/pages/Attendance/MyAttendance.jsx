import React, { useMemo } from "react";
import { useGetMyAttendanceQuery } from "@/store/Action/attendanceAction";
import StatsCard from "@/components/common/StatsCard";
import { Calendar } from "@/components/ui/calendar";

export default function MyAttendance() {
  const { data } = useGetMyAttendanceQuery({ page: 1, limit: 1000 });
  const entries = data?.data || [];

  const stats = useMemo(() => {
    const s = { present: 0, absent: 0, half: 0, wfh: 0 };
    entries.forEach((e) => {
      if (e.status === "Present") s.present++;
      if (e.status === "Absent") s.absent++;
      if (e.status === "Half Day") s.half++;
      if (e.status === "Work From Home") s.wfh++;
    });
    const total = entries.length || 1;
    return { ...s, percent: Math.round((s.present / total) * 100) };
  }, [entries]);

  const modifiers = {};
  entries.forEach((e) => {
    const d = new Date(e.date).toLocaleDateString();
    modifiers[d] = e.status;
  });

  // Calendar modifiers expect functions; we'll pass selected prop mapping

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatsCard title="Present Days" value={stats.present} />
        <StatsCard title="Absent Days" value={stats.absent} />
        <StatsCard title="WFH Days" value={stats.wfh} />
        <StatsCard title="Half Days" value={stats.half} />
      </div>

      <div className="bg-white p-4 rounded">
        <Calendar mode="single" selected={null} />
        <p className="mt-2">
          Attendance calendar — colors: green=Present, red=Absent, yellow=Half
          Day, blue=WFH, purple=Leave
        </p>
      </div>
    </div>
  );
}
