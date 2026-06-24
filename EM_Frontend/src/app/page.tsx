"use client";

import { ROLES } from "@/src/constant/role";
import { getCookie } from "@/src/lib/cookieStorage";
import AdminDashboard from "./dashboard/AdminDashboard";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";

export default function Home() {
  const role = getCookie("role");
  return role === ROLES.ADMIN ? <AdminDashboard /> : <EmployeeDashboard />;
}
