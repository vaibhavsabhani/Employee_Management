import React from "react";
import { useGetMyBalanceQuery } from "@/store/Action/leaveAction";
import StatsCard from "@/components/common/StatsCard";

export default function LeaveBalance() {
  const { data } = useGetMyBalanceQuery();
  const bal = data?.data || {};

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Casual Leave Remaining"
          value={bal.casualLeave || 0}
        />
        <StatsCard title="Sick Leave Remaining" value={bal.sickLeave || 0} />
        <StatsCard
          title="Earned Leave Remaining"
          value={bal.earnedLeave || 0}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatsCard title="Used Leaves" value={bal.usedLeaves || 0} />
        <StatsCard title="Total Remaining" value={bal.remainingLeaves || 0} />
      </div>
    </div>
  );
}
