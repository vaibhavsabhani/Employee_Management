"use client";

import { useEffect, useState } from "react";
import { ROLES } from "@/src/constant/role";
import { getCookie } from "@/src/lib/cookieStorage";
import AttendancePage from "./AttendancePage";
import MyAttendancePage from "./MyAttendancePage";

const Page = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getCookie("role") ?? "");
  }, []);

  if (role === null) return null;

  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  return isAdmin ? <AttendancePage /> : <MyAttendancePage />;
};

export default Page;
