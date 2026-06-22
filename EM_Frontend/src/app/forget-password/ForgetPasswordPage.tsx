"use client";

import { AuthLayout } from "@/src/components/custom/AuthLayout";
import { Toast } from "@/src/components/custom/Toast";
import { InputField } from "@/src/components/form/InputField";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import {
  forgetPasswordFormInput,
  forgetPasswordFormValues,
  ForgetPasswordSchema,
} from "@/src/schema/forgetpassword.schema";
import { useForgetPasswordMutation } from "@/src/store/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const ForgetPasswordPage = () => {
  const router = useRouter();

  const form = useForm<
    forgetPasswordFormInput,
    undefined,
    forgetPasswordFormValues
  >({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();

  const onSubmit = async (data: forgetPasswordFormValues) => {
    const res = await forgetPassword(data?.email)
    if (res?.error) {
      Toast(res, "error");
      return;
    }
    Toast(res, "success");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <AuthLayout>
      <Card className="border-white/10 bg-white/96 shadow-[0_28px_80px_rgba(2,8,23,0.42)] backdrop-blur-xl">
        <CardHeader className="space-y-5 border-b border-slate-200/80 px-8 pb-6 pt-8 dark:border-white/10 sm:px-10">
          <div className="flex items-center gap-3 text-slate-950 dark:text-white">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 text-white shadow-lg shadow-blue-950/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-blue-700 dark:text-blue-300">
                Employee Management System
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                HR Pro Pulse
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Reset Password
            </CardTitle>
            <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Please enter your Email to Get the Reset Password link.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8  sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <InputField
                control={form.control}
                name="email"
                label="Email Address"
                required
                type="email"
                placeholder="e.g. name@company.com"
              />

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 cursor-pointer"
                  onClick={() => {
                    router.push("/login");
                  }}
                >
                  <ArrowLeft className="size-3" />
                  Back to Login
                </button>
              </div>

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl text-sm font-semibold shadow-[0_18px_40px_rgba(15,45,107,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#12357d]"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ForgetPasswordPage;
