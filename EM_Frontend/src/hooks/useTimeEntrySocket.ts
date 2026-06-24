"use client";

import { useEffect, useRef } from "react";

/**
 * Listens to time-entry socket events broadcast by NotificationBell
 * via window CustomEvent ("timeentry:update"). Avoids duplicate socket connections.
 */
export function useTimeEntrySocket(onEvent: (type: string) => void) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const handler = (e: Event) => {
      const { type } = (e as CustomEvent<{ type: string }>).detail;
      callbackRef.current(type);
    };
    window.addEventListener("timeentry:update", handler);
    return () => window.removeEventListener("timeentry:update", handler);
  }, []);
}
