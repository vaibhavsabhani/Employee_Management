"use client";

import { useLocalStorageValue } from "@/src/hooks/useLocalstorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const accessToken = useLocalStorageValue("accessToken");

  useEffect(() => {
    debugger
    if (!accessToken) {
      router.replace("/login");
    }
  }, [router, accessToken]);

  return null;
}
