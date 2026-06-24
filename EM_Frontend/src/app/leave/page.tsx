"use client";

import { ROLES } from "@/src/constant/role";
import { getCookie } from "@/src/lib/cookieStorage";
import AdminLeavePage from "./AdminLeavePage";
import LeavePage from "./LeavePage";

const Page = () => {
  const role = getCookie("role");
  return role === ROLES.ADMIN ? <AdminLeavePage /> : <LeavePage />;
};

export default Page;
