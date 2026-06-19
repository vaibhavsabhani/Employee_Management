"use client";

import { AuthLayout } from "@/components/custom/AuthLayout";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InputField } from "@/components/form/InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormInput,
  type LoginFormValues,
} from "@/schema/login.schema";

const LoginPage = () => {
  const form = useForm<LoginFormInput, undefined, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    console.log(values);
  }
  return (
    <AuthLayout>
      {" "}
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
              Welcome back
            </CardTitle>
            <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Please enter your enterprise credentials to access your dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 py-8 sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="e.g. name@company.com"
                        className="h-11 rounded-xl border-slate-200 bg-white/90 text-slate-950 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/25 dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <InputField
                control={form.control}
                name="password"
                label="Password"
                required
                type="password"
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-slate-300 data-[state=checked]:bg-blue-700 data-[state=checked]:text-white"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-slate-600 dark:text-slate-300">
                        Remember Me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <button
                  type="button"
                  className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl bg-[#0F2D6B] text-sm font-semibold shadow-[0_18px_40px_rgba(15,45,107,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#12357d]"
              >
                Sign In
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4 border-t border-slate-200/80 bg-slate-50/80 px-8 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© 2024 HR Pro Pulse Inc.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="transition-colors hover:text-slate-950 dark:hover:text-white"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="transition-colors hover:text-slate-950 dark:hover:text-white"
              href="#"
            >
              Terms
            </a>
            <a
              className="transition-colors hover:text-slate-950 dark:hover:text-white"
              href="#"
            >
              Support
            </a>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
