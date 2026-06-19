"use client";

import { useLocalStorageValue } from "@/hooks/useLocalstorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const token = useLocalStorageValue("token");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  return null;
}
