import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/store/action";

const schema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be 6+ characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

const onSubmit = async (data) => {
  try {
    const response = await login(data).unwrap();

    console.log("Login Response:", response);

    // Store token
    localStorage.setItem("token", response.token);

    // Store user
    localStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    // Navigate dashboard
    navigate("/dashboard");
  } catch (error) {
    console.log("Login Error:", error);

    alert(
      error?.data?.message || "Something went wrong"
    );
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between py-4 px-6">
        <div className="text-purple-700 font-bold">NexusAuth</div>
        <nav className="flex items-center gap-6 text-sm">
          <a className="text-muted-foreground hover:text-foreground">Product</a>
          <a className="text-muted-foreground hover:text-foreground">
            Developers
          </a>
          <a className="text-purple-700 font-medium">Support</a>
        </nav>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg rounded-xl shadow-xl">
          <CardContent>
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center">Welcome back</h2>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Enter your credentials to access your account
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-6 grid gap-4"
              >
                <div>
                  <Label className="uppercase text-xs">Email address</Label>
                  <Input type="email" {...register("email")} className="mt-1" />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="uppercase text-xs">Password</Label>
                    <a className="text-sm text-purple-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    type="password"
                    {...register("password")}
                    className="mt-1"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-background"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground"
                  >
                    Keep me signed in
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <div className="text-sm text-muted-foreground">
                    Or continue with
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <img src="/google.svg" alt="Google" className="h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <img src="/github.svg" alt="GitHub" className="h-4 w-4" />
                    GitHub
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a className="text-purple-600 font-medium">Sign Up</a>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="py-6 px-6 border-t text-sm text-muted-foreground">
        <div className="container-card">
          <div className="flex items-center justify-between">
            <div>NexusAuth © 2026 Nexus Enterprise. All rights reserved.</div>
            <div className="flex gap-4">
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
              <a>Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
