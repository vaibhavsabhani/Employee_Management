import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LifeBuoy,
} from "lucide-react";

export const sidebarItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Reports", path: "#", icon: FileText, disabled: true },
  { label: "Settings", path: "#", icon: Settings, disabled: true },
];

export const bottomSidebarItems = [
  { label: "Support", path: "#", icon: LifeBuoy, disabled: true },
];
