"use client";

import { InputField } from "@/src/components/form/InputField";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import {
  useLazyGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/src/store/action/employee/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN (e.g. ABCDE1234F)")
    .optional()
    .or(z.literal("")),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [fetchProfile] = useLazyGetMyProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      panNumber: "",
      aadhaarNumber: "",
    },
  });

  const { reset, handleSubmit } = form;

  // profile data for display-only fields
  const email = form.watch("_email" as any) as string | undefined;
  const role = form.watch("_role" as any) as string | undefined;

  useEffect(() => {
    fetchProfile(undefined)
      .unwrap()
      .then((res) => {
        const u = res?.user;
        if (!u) return;
        reset({
          firstName: u.firstName ?? "",
          middleName: u.middleName ?? "",
          lastName: u.lastName ?? "",
          phoneNumber: u.phoneNumber ?? "",
          address: u.address ?? "",
          panNumber: u.panNumber ?? "",
          aadhaarNumber: u.aadhaarNumber ?? "",
          _email: u.email,
          _role: u.role?.name,
        } as any);
        setProfilePicture(u.profilePicture ?? null);
      })
      .catch(() => {});
  }, [fetchProfile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: any = { ...values };
    delete payload._email;
    delete payload._role;
    const res = await updateProfile(payload);
    if (res?.error) {
      Toast(res, "error");
      return;
    }
    Toast(res, "success");
  };

  const initials = [
    form.watch("firstName"),
    form.watch("lastName"),
  ]
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
      />

      {/* Avatar strip */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-blue-900 flex items-center justify-center text-white text-2xl font-bold shrink-0 overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="size-full object-cover" />
            ) : (
              initials || <UserCircle className="size-8" />
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {[form.watch("firstName"), form.watch("middleName"), form.watch("lastName")]
                .filter(Boolean)
                .join(" ") || "—"}
            </p>
            <p className="text-sm text-muted-foreground">{email || "—"}</p>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 capitalize">
              {role || "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Read-only info */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <CardTitle className="text-base font-semibold">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <div className="h-10 flex items-center rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-500 dark:text-slate-400 select-none">
                  {email || "—"}
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <div className="h-10 flex items-center rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-500 dark:text-slate-400 capitalize select-none">
                  {role || "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable fields */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <CardTitle className="text-base font-semibold">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  control={form.control}
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  required
                />
                <InputField
                  control={form.control}
                  name="middleName"
                  label="Middle Name"
                  placeholder="(optional)"
                />
                <InputField
                  control={form.control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  control={form.control}
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                />
                <InputField
                  control={form.control}
                  name="address"
                  label="Address"
                  placeholder="123 Main St, City"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  control={form.control}
                  name="panNumber"
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                />
                <InputField
                  control={form.control}
                  name="aadhaarNumber"
                  label="Aadhaar Number"
                  placeholder="123456789012"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 h-10 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
