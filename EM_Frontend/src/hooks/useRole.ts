"use client";

import { useEffect, useState } from "react";
import { getCookie } from "@/src/lib/cookieStorage";

export function useRole() {
  const [role, setRole] = useState<string>(() => getCookie("role") ?? "");

  useEffect(() => {
    setRole(getCookie("role") ?? "");
  }, []);

  return role;
}