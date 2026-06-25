"use client";

import { useEffect, useState } from "react";
import { ROLES } from "@/src/constant/role";
import { getCookie } from "@/src/lib/cookieStorage";
import AdminDashboard from "./dashboard/AdminDashboard";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";

export default function Home() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getCookie("role") ?? "");
  }, []);

  if (role === null) return null;

  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
}
