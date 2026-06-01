import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function Unauthorized() {
  const navigate = useNavigate();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  const role = user?.role || "Unknown";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Layout>
        <div className="flex-1 flex h-full items-center justify-center p-6">
          <Card className="w-full max-w-md rounded-xl shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Access Denied</CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                You don't have permission to view this page.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-4 px-8 py-6">
              <div className="flex items-center justify-center h-28 w-28 rounded-full bg-destructive/10 text-destructive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 15v2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="3" y="7" width="18" height="11" rx="2" />
                  <path
                    d="M7 7V6a5 5 0 0 1 10 0v1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold">Restricted Role</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account role{" "}
                  <span className="font-medium text-foreground">{role}</span>{" "}
                  doesn't have access to this resource.
                </p>
              </div>

              <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Need help? Contact your administrator.
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  Home
                </Button>
                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
    </Layout>
  );
}
