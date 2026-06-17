import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LifeBuoy,
  Clock,
} from "lucide-react";
import { ROLES } from "@/constant/roles";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  EMPLOYEE_ADD: "/employees/new",
  EMPLOYEE_EDIT: "/employees/edit/:id",
  EMPLOYEE_PROFILE: "/employees/:id",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  TIME_TRACKING: "/time-tracking",
  TIME_TRACKING_NEW: "/time-tracking/new",
  UNAUTHORIZED: "/unauthorized",
  ATTENDANCE: "/attendance",
  ATTENDANCE_CREATE: "/attendance/create",
  ATTENDANCE_EDIT: "/attendance/edit/:id",
  ATTENDANCE_DETAILS: "/attendance/:id",
  MY_ATTENDANCE: "/my-attendance",

  LEAVES: "/leaves",
  APPLY_LEAVE: "/apply-leave",
  MY_LEAVES: "/my-leaves",
  LEAVE_DETAILS: "/leaves/:id",
  LEAVE_BALANCE: "/leave-balance",

  NOTIFICATIONS: "/notifications",
};

export const sidebarItems = [
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Employees",
    path: ROUTES.EMPLOYEES,
    icon: Users,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Attendance",
    path: ROUTES.ATTENDANCE,
    icon: Clock,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Leave Requests",
    path: ROUTES.LEAVES,
    icon: FileText,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Reports",
    path: ROUTES.REPORTS,
    icon: FileText,
    disabled: true,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Settings",
    path: ROUTES.SETTINGS,
    icon: Settings,
    disabled: true,
    roles: [ROLES.ADMIN],
  },
  {
    label: "Time Tracking",
    path: ROUTES.TIME_TRACKING,
    icon: Clock,
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
];

export const sidebarItemsEmployee = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "My Attendance", path: ROUTES.MY_ATTENDANCE, icon: Clock },
  { label: "My Leaves", path: ROUTES.MY_LEAVES, icon: FileText },
  { label: "Apply Leave", path: ROUTES.APPLY_LEAVE, icon: FileText },
  { label: "Leave Balance", path: ROUTES.LEAVE_BALANCE, icon: FileText },
  { label: "Notifications", path: ROUTES.NOTIFICATIONS, icon: LifeBuoy },
];

export const bottomSidebarItems = [
  { label: "Support", path: "#", icon: LifeBuoy, disabled: true },
];
