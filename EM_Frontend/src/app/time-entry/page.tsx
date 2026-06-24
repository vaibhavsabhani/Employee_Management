"use client";

import { useEffect, useState } from "react";
import { ROLES } from "@/src/constant/role";
import { getCookie } from "@/src/lib/cookieStorage";
import TimeEntryPage from "./TimeEntryPage";
import AdminTimeEntryPage from "./AdminTimeEntryPage";

const Page = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getCookie("role") ?? "");
  }, []);

  if (role === null) return null;

  return role === ROLES.ADMIN ? (
    <AdminTimeEntryPage />
  ) : (
    <TimeEntryPage />
  );
};

export default Page;
