"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";

import {
  LayoutDashboard,
  Users,
  Clock3,
  CalendarDays,
  ClipboardList,
  Settings,
  LogOut,
  Building2,
  ActivitySquare,
} from "lucide-react";

import { ROLES } from "@/src/constant/role";
import { deleteCookie } from "@/src/lib/cookieStorage";
import { useLogoutMutation } from "@/src/store/action/auth/auth";

type Props = {
  pathname: string;
  userRole?: string;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    label: "Time Entry",
    href: "/time-entry",
    icon: Clock3,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Leave",
    href: "/leave",
    icon: CalendarDays,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: ClipboardList,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Activity Logs",
    href: "/logs",
    icon: ActivitySquare,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    accessRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EMPLOYEE],
  },
];

export function AppSidebar({ pathname, userRole }: Props) {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [logoutApi] = useLogoutMutation();

  const visibleNavigation = navigation.filter(
    (item) => userRole && item.accessRoles.includes(userRole),
  );

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // proceed regardless
    }
    deleteCookie("accessToken");
    deleteCookie("user");
    deleteCookie("role");
    router.replace("/login");
  };

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-3">
        <div className="flex items-center gap-3 px-3 pt-3 pb-1">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "var(--sidebar-primary)",
              boxShadow: "0 0 18px rgba(79,128,255,0.45)",
            }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>

          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-tight text-white">
              Enterprise HR
            </span>
            <span
              className="truncate text-[11px] font-medium"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              Admin Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2 border-t border-gray-500">
        <SidebarMenu className="gap-0.5 px-2">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={[
                    "group/item relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    "transition-all duration-150 ease-out",
                    "overflow-hidden",
                    "text-sidebar-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon size={18} className={"text-white"} />

                  <span className="flex-1 truncate group-data-[collapsible=icon]:hidden font-extrabold">
                    {item.label}
                  </span>

                  {isActive && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full group-data-[collapsible=icon]:hidden"
                      style={{
                        background: "var(--sidebar-primary)",
                        boxShadow: "0 0 6px rgba(79,128,255,0.8)",
                      }}
                    />
                  )}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-500 pt-2">
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <button
              type="button"
              onClick={handleLogout}
              className={[
                "group/logout relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-all duration-150 ease-out",
                "text-sidebar-foreground",
                "hover:bg-sidebar-accent hover:translate-x-0.5",
              ].join(" ")}
            >
              <LogOut
                size={18}
                className="opacity-70 transition-opacity group-hover/logout:opacity-100"
              />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Logout
              </span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
