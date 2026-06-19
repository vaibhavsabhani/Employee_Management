"use client";

import { useEffect, useState } from "react";

export function useLocalStorageValue<T = string>(key: string) {
  const [value, setValue] = useState<T | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const item = localStorage.getItem(key);

    if (item === null) {
      setValue(undefined);
      return;
    }

    try {
      setValue(JSON.parse(item) as T);
    } catch {
      setValue(item as T);
    }
  }, [key]);

  return value;
}