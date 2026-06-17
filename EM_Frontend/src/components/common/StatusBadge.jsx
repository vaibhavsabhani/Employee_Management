import React from "react";

const colorMap = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  "Half Day": "bg-yellow-100 text-yellow-800",
  "Work From Home": "bg-blue-100 text-blue-800",
  "Paid Leave": "bg-purple-100 text-purple-800",
  "Unpaid Leave": "bg-gray-100 text-gray-800",
};

export default function StatusBadge({ status }) {
  const classes = colorMap[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
      {status}
    </span>
  );
}
