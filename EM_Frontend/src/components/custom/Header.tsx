"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

import { SidebarTrigger } from "@/src/components/ui/sidebar";

import { Bell, Settings } from "lucide-react";

type HeaderProps = {
  pageTitle: string;
  userName?: string;
  userRole?: string;
};

export function Header({
  pageTitle,
  userName = "Admin",
  userRole,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-white" id="header">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* Left — mobile menu trigger + breadcrumb */}
        <div className="flex items-center gap-3 text-sm">
          {/* Hamburger — only visible on mobile (sidebar is hidden on mobile) */}
          <SidebarTrigger className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-500">Home</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{pageTitle}</span>
          </div>
        </div>

        {/* Right — actions + user */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="text-slate-600 transition hover:text-slate-900"
            type="button"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>

          <button
            className="text-slate-600 transition hover:text-slate-900"
            type="button"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </button>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-900 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700">
                {userRole ?? "Super Admin"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}