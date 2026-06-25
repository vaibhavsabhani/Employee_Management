"use client";

import { AuthLayout } from "@/src/components/custom/AuthLayout";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import { InputField } from "@/src/components/form/InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormInput,
  type LoginFormValues,
} from "@/src/schema/login.schema";
import { useLoginMutation } from "@/src/store/action";
import { Toast } from "@/src/components/custom/Toast";
import { LoginResponse } from "@/src/types/auth.types";
import { setCookie } from "@/src/lib/cookieStorage";

const LoginPage = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const form = useForm<LoginFormInput, undefined, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loginResponse = (await login(data).unwrap()) as LoginResponse;
      setCookie("accessToken", loginResponse.accessToken);
      setCookie("user", JSON.stringify(loginResponse.user));
      setCookie("role", loginResponse.user.role.name);
      Toast(loginResponse, "success");
      router.push("/");
    } catch (error) {
      Toast(error, "error");
    }
  };

  return (
    <AuthLayout>
      <Card className="border-white/10 bg-white dark:bg-slate-900 shadow-[0_28px_80px_rgba(2,8,23,0.42)] backdrop-blur-xl pb-6">
        <CardHeader className="space-y-5 border-b border-slate-200/80 px-8 pb-6 pt-8 dark:border-white/10 sm:px-10 bg-white/96 dark:bg-slate-900/96 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-slate-950 dark:text-white">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 text-white shadow-lg shadow-blue-950/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="font-bold uppercase tracking-[0.28em] text-[#1919ed] dark:text-blue-300">
                Aksharam Fintech Pvt Ltd
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Please enter your enterprise credentials to access your dashboard.
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

              <InputField
                control={form.control}
                name="password"
                label="Password"
                required
                type="password"
                placeholder="Enter your password"
              />

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 cursor-pointer"
                  onClick={() => {
                    router.push("/forget-password");
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full rounded-xl text-sm font-semibold shadow-[0_18px_40px_rgba(15,45,107,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#12357d]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
