"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Employee } from "../app/employees/EmployeePage";

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
};

const SEGMENT_LABELS: Record<string, string> = {
  "": "Dashboard",
  employees: "Employees",
  "time-entry": "Time Entry",
  leave: "Leave",
  attendance: "Attendance",
  settings: "Settings",
  profile: "Profile",
  add: "Add",
  edit: "Edit",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toLabel(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (UUID_RE.test(segment) || /^\d+$/.test(segment)) return "Detail";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type BreadcrumbItem = { label: string; href?: string };

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === "/") return [{ label: "Dashboard" }];

  const segments = pathname.split("/").filter(Boolean);

  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  segments.forEach((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    crumbs.push({ label: toLabel(seg), href: isLast ? undefined : href });
  });

  return crumbs;
}

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export const initials = (emp: Pick<Employee, "firstName" | "lastName">) => {
  return [emp.firstName?.[0], emp.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
};