"use client";

import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { AppSidebar } from "./Siderbar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { useEffect, useState } from "react";
import { getCookie } from "@/src/lib/cookieStorage";

type MainLayoutProps = {
  children: React.ReactNode;
};

const authRoutes = ["/login", "/forget-password", "/reset-password"];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie("accessToken");
    if (!token) {
      router.replace("/login");
    }
    setUserRole(getCookie("role"));
  }, [router, pathname]);

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} userRole={userRole ?? undefined} />

      <SidebarInset>
        <Header userRole={userRole ?? undefined} />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
