"use client";

import { usePathname } from "next/navigation";

import { useLocalStorageValue } from "@/src/hooks/useLocalstorage";
import { Header } from "./Header";
import { AppSidebar } from "./Siderbar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";

type MainLayoutProps = {
  children: React.ReactNode;
};

const authRoutes = ["/login", "/forget-password", "/reset-password"];

function getPageTitle(pathname: string) {
  if (pathname === "/") {
    return "Dashboard";
  }

  const segments = pathname.split("/").filter(Boolean);

  const lastSegment = segments[segments.length - 1];

  return lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const userRole = useLocalStorageValue<string>("role");

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <AppSidebar pathname={pathname} userRole={userRole} />

      <SidebarInset>
        <Header pageTitle={pageTitle} userRole={userRole} />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
