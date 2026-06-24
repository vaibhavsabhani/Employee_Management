"use client";

import { useEffect, useRef } from "react";

/**
 * Listens to leave-related socket events broadcast by NotificationBell
 * via window CustomEvent ("leave:update"). Avoids duplicate socket connections.
 */
export function useLeaveSocket(onEvent: (type: string) => void) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const handler = (e: Event) => {
      const { type } = (e as CustomEvent<{ type: string }>).detail;
      callbackRef.current(type);
    };
    window.addEventListener("leave:update", handler);
    return () => window.removeEventListener("leave:update", handler);
  }, []);
}
