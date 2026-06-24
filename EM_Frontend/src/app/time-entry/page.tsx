"use client";

import { ROLES } from "@/src/constant/role";
import TimeEntryPage from "./TimeEntryPage";
import AdminTimeEntryPage from "./AdminTimeEntryPage";
import { getCookie } from "@/src/lib/cookieStorage";

const Page = () => {
  const role = getCookie("role");

  console.log("Role:", role);

  return role === ROLES.ADMIN ? (
    <AdminTimeEntryPage />
  ) : (
    <TimeEntryPage />
  );
};

export default Page;