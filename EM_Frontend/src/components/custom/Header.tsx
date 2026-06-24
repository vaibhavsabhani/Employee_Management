"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

import { SidebarTrigger } from "@/src/components/ui/sidebar";

import { getBreadcrumbs } from "@/src/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

type HeaderProps = {
  userName?: string;
  userRole?: string;
};

export function Header({ userName = "Admin", userRole }: HeaderProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background" id="header">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* Left — mobile menu trigger + breadcrumb */}
        <div className="flex items-center gap-3 text-sm">
          <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-2 py-1 transition-colors" />

          {/* Dynamic breadcrumb */}
          <nav className="flex items-center gap-1.5">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-border select-none">/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-foreground">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right — actions + user */}
        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />

          <Link
            href="/settings"
            className="flex items-center text-muted-foreground transition hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Link>

          <div className="h-8 w-px bg-border" />

          <Link href="/profile" className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10 border group-hover:ring-2 group-hover:ring-violet-400 transition-all">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-900 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground group-hover:text-violet-700 transition-colors">
                {userName}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700 dark:text-blue-400">
                {userRole ?? "Super Admin"}
              </p>
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
}
