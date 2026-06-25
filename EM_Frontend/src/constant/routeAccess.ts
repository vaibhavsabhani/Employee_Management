import { ROLES } from "./role";

const ADMINS = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const EMPLOYEE_ONLY = [ROLES.EMPLOYEE];

type AccessRule = { match: RegExp; allow: string[] };

/**
 * Route-level access rules. First match wins.
 *
 * Routes not listed here are open to any authenticated user. The list/landing
 * routes (`/time-entry`, `/leave`, `/attendance`) render role-specific views
 * internally, so only their sub-routes (forms) need explicit gating.
 */
const ACCESS_RULES: AccessRule[] = [
  // Employee-only forms: create / resubmit a time entry, apply for leave.
  { match: /^\/time-entry\/.+/, allow: EMPLOYEE_ONLY },
  { match: /^\/leave\/.+/, allow: EMPLOYEE_ONLY },

  // Admin-only sections.
  { match: /^\/employees(\/.*)?$/, allow: ADMINS },
  { match: /^\/logs(\/.*)?$/, allow: ADMINS },
];

/**
 * Roles permitted to access a route, or `null` when any authenticated user may.
 */
export function getAllowedRoles(pathname: string): string[] | null {
  const rule = ACCESS_RULES.find((r) => r.match.test(pathname));
  return rule ? rule.allow : null;
}

/**
 * Whether `role` may access `pathname`. While the role is still unknown
 * (`null`/`undefined`) we allow it through so the layout can resolve once the
 * role cookie is read.
 */
export function isRouteAllowed(pathname: string, role?: string | null): boolean {
  const allowed = getAllowedRoles(pathname);
  if (!allowed) return true;
  if (!role) return true;
  return allowed.includes(role);
}
