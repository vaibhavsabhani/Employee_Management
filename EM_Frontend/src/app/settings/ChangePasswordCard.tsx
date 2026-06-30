"use client";

import { Toast } from "@/src/components/custom/Toast";
import { InputField } from "@/src/components/form/InputField";
import { Button } from "@/src/components/ui/button";
import { Form } from "@/src/components/ui/form";
import { useChangePasswordMutation } from "@/src/store/action/auth/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordCard() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const res = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if ((res as any)?.error) {
      Toast(res, "error");
      return;
    }
    Toast(res, "success");
    form.reset();
  };

  return (
    <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Change Password
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Update your password. A confirmation email will be sent to you.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            control={form.control}
            name="currentPassword"
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            required
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              required
            />
            <InputField
              control={form.control}
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="h-10 px-6">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ChangePasswordCard;
