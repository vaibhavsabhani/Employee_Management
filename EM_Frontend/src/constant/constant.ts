export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const TIME_ENTRY_STATUS = [
  { label: "All", value: "" },
  { label: "Pending", value: "1" },
  { label: "Approved", value: "2" },
  { label: "Rejected", value: "3" },
];

export const ATTENDANCE_STATUS_FILTER = [
  { label: "All", value: "" },
  { label: "Present", value: "present" },
  { label: "On Leave", value: "on-leave" },
  { label: "Absent", value: "absent" },
  { label: "Not Marked", value: "not-marked" },
];

export const ATTENDANCE_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  present: {
    label: "Present",
    className:
      "bg-badge-success  text-badge-success-fg  border border-badge-success-ring",
  },
  "on-leave": {
    label: "On Leave",
    className:
      "bg-badge-info     text-badge-info-fg     border border-badge-info-ring",
  },
  absent: {
    label: "Absent",
    className:
      "bg-badge-danger   text-badge-danger-fg   border border-badge-danger-ring",
  },
  "not-marked": {
    label: "Not Marked",
    className:
      "bg-badge-neutral text-badge-neutral-fg  border border-badge-neutral-ring",
  },
};

export const LEAVE_STATUS = [
  { label: "All", value: "" },
  { label: "Pending", value: "1" },
  { label: "Approved", value: "2" },
  { label: "Rejected", value: "3" },
];

export const LEAVE_STATUS_MAP: Record<
  number,
  { label: string; className: string }
> = {
  1: {
    label: "Pending",
    className:
      "bg-badge-pending  text-badge-pending-fg  border border-badge-pending-ring",
  },
  2: {
    label: "Approved",
    className:
      "bg-badge-success  text-badge-success-fg  border border-badge-success-ring",
  },
  3: {
    label: "Rejected",
    className:
      "bg-badge-danger   text-badge-danger-fg   border border-badge-danger-ring",
  },
};

export const LEAVE_TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Sick Leave", value: "1" },
  { label: "Casual Leave", value: "2" },
  { label: "Annual Leave", value: "3" },
  { label: "Unpaid Leave", value: "4" },
];

export const LEAVE_TYPE_MAP: Record<
  number,
  { label: string; className: string }
> = {
  1: {
    label: "Sick Leave",
    className:
      "bg-badge-danger  text-badge-danger-fg   border border-badge-danger-ring",
  },
  2: {
    label: "Casual Leave",
    className:
      "bg-badge-info    text-badge-info-fg     border border-badge-info-ring",
  },
  3: {
    label: "Annual Leave",
    className:
      "bg-badge-purple  text-badge-purple-fg   border border-badge-purple-ring",
  },
  4: {
    label: "Unpaid Leave",
    className:
      "bg-badge-neutral text-badge-neutral-fg  border border-badge-neutral-ring",
  },
};

export const STATUS_MAP: Record<number, { label: string; className: string }> =
  {
    1: {
      label: "Pending",
      className:
        "bg-badge-pending  text-badge-pending-fg  border border-badge-pending-ring",
    },
    2: {
      label: "Approved",
      className:
        "bg-badge-success  text-badge-success-fg  border border-badge-success-ring",
    },
    3: {
      label: "Rejected",
      className:
        "bg-badge-danger   text-badge-danger-fg   border border-badge-danger-ring",
    },
  };

export const PALETTE = {
  violet: "#7c3aed",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  slate: "#64748b",
};

export const LEAVE_COLORS = [
  PALETTE.violet,
  PALETTE.blue,
  PALETTE.amber,
  PALETTE.green,
  PALETTE.red,
];
