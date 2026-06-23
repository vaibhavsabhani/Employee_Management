import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const setLocalStorage = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getPageTitle = (pathname: string) => {
  if (pathname === "/") {
    return "Dashboard";
  }

  const segments = pathname.split("/").filter(Boolean);

  const lastSegment = segments[segments.length - 1];

  return lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
