"use client";

import { ROLES } from "@/src/constant/role";
import AdminDashboard from "./dashboard/AdminDashboard";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";
import { useRole } from "../hooks/useRole";

export default function Home() {
  const role = useRole();
  if (role === null) return null;

  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
}
