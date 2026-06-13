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
};

export const sidebarItems = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.EMPLOYEE] },
  { label: "Employees", path: ROUTES.EMPLOYEES, icon: Users, roles: [ROLES.ADMIN] },
  { label: "Reports", path: ROUTES.REPORTS, icon: FileText, disabled: true, roles: [ROLES.ADMIN] },
  { label: "Settings", path: ROUTES.SETTINGS, icon: Settings, disabled: true, roles: [ROLES.ADMIN] },
  { label: "Time Tracking", path: ROUTES.TIME_TRACKING, icon: Clock, roles: [ROLES.ADMIN, ROLES.EMPLOYEE] }
];

export const bottomSidebarItems = [
  { label: "Support", path: "#", icon: LifeBuoy, disabled: true },
];


