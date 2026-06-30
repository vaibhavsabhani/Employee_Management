"use client";

import Loader from "@/src/components/custom/Loader";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { DetailRow } from "@/src/components/ui/custom/DetailRow";
import { getCookie } from "@/src/lib/cookieStorage";
import { ROLES } from "@/src/constant/role";
import { useGetSingleEmployeeMutation } from "@/src/store/action";
import { CalendarDays, Mail, Pencil, Phone, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { employeeDialogConfig } from "../../employeeConfig";
import { EmployeeEmailLogs } from "../EmployeeEmailLogs";

const EmployeeViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.employeeId as string;

  const [getSingleEmployee, { isLoading }] = useGetSingleEmployeeMutation();
  const data = useSelector((state: any) => state.employee.data[0]);
  const user = data?.user;

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    setIsSuperAdmin(getCookie("role") === ROLES.SUPER_ADMIN);
  }, []);

  useEffect(() => {
    if (employeeId) getSingleEmployee(employeeId);
  }, [employeeId, getSingleEmployee]);

  if (isLoading && !user) return <Loader />;
  if (!user) return null;

  const config = employeeDialogConfig(user);
  if (!config) return null;

  const phone =
    [user.countryCode, user.phoneNumber].filter(Boolean).join(" ") || null;
  const joined = new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Details"
        description="View employee profile and information."
        action={
          <Button onClick={() => router.push(`/employees/${employeeId}`)}>
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Profile card */}
        <Card className="overflow-hidden p-0 lg:col-span-1">
          <div className="flex flex-col items-center gap-3 bg-linear-to-br from-violet-600 to-violet-800 px-6 pb-8 pt-8 text-center">
            <div className="size-24 overflow-hidden rounded-full ring-4 ring-white/30">
              {config.avatar ? (
                <img
                  src={config.avatar}
                  alt={config.initials}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-white/20 text-3xl font-bold text-white">
                  {config.initials || <User className="size-9" />}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config.title}</h2>
              {config.subtitle && (
                <p className="mt-1 text-sm capitalize text-white/70">
                  {config.subtitle}
                </p>
              )}
            </div>
            {config.isActive !== undefined && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  config.isActive
                    ? "bg-green-400/20 text-green-100 ring-1 ring-green-300/40"
                    : "bg-red-400/20 text-red-100 ring-1 ring-red-300/40"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    config.isActive ? "bg-green-300" : "bg-red-300"
                  }`}
                />
                {config.isActive ? "Active" : "Inactive"}
              </span>
            )}
          </div>

          {/* Quick contact */}
          <div className="flex flex-col gap-1 p-4">
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <div className="rounded-md bg-muted p-2">
                <Mail className="size-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <p className="truncate text-sm text-foreground">{user.email}</p>
              </div>
            </a>

            <a
              href={phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted aria-disabled:pointer-events-none"
              aria-disabled={!phone}
            >
              <div className="rounded-md bg-muted p-2">
                <Phone className="size-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </p>
                <p className="truncate text-sm text-foreground">
                  {phone || (
                    <span className="italic text-muted-foreground/60">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </a>

            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="rounded-md bg-muted p-2">
                <CalendarDays className="size-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Joined
                </p>
                <p className="truncate text-sm text-foreground">{joined}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Details card */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-lg font-semibold">Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-8 px-6 py-2 sm:grid-cols-2">
            {config.fields.map((field) => (
              <DetailRow
                key={field.label}
                icon={field.icon}
                label={field.label}
                value={field.value as string | null | undefined}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Email history — super admin only */}
      {isSuperAdmin && <EmployeeEmailLogs employeeId={employeeId} />}
    </div>
  );
};

export default EmployeeViewPage;
