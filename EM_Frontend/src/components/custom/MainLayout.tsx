"use client";

import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { AppSidebar } from "./Siderbar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { useEffect, useState } from "react";
import { getCookie } from "@/src/lib/cookieStorage";
import { useGetMyProfileQuery } from "@/src/store/action/employee/employee";
import { isRouteAllowed } from "@/src/constant/routeAccess";

type MainLayoutProps = {
  children: React.ReactNode;
};

const authRoutes = ["/login", "/forget-password", "/reset-password"];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }
    const token = getCookie("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    const role = getCookie("role");
    setUserRole(role);

    // Block direct-URL access to routes the current role isn't allowed on.
    if (!isRouteAllowed(pathname, role)) {
      router.replace("/");
    }
  }, [router, pathname]);

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const { data: profileData } = useGetMyProfileQuery(undefined, {
    skip: isAuthRoute,
  });
  const user = (profileData as any)?.user;
  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : undefined;
  const profilePicture: string | undefined = user?.profilePicture ?? undefined;

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Don't render the page while an unauthorized role is being redirected away.
  const authorized = isRouteAllowed(pathname, userRole);

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} userRole={userRole ?? undefined} />

      <SidebarInset>
        <Header
          userRole={userRole ?? undefined}
          userName={userName}
          profilePicture={profilePicture}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full">{authorized ? children : null}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
