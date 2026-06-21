"use client";

import { useState } from "react";

export function useLocalStorageValue<T = string>(key: string) {
  const [value] = useState<T | undefined>(() => {
    if (typeof window === "undefined") return undefined;

    const item = localStorage.getItem(key);

    if (!item) return undefined;

    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  });

  return value;
}