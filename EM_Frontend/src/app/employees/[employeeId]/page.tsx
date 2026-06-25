"use client";

import { AvatarUpload } from "@/src/components/custom/AvatarUpload";
import Loader from "@/src/components/custom/Loader";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { InputField } from "@/src/components/form/InputField";
import { SelectField } from "@/src/components/form/SelectField";
import { SwitchField } from "@/src/components/form/SwitchField";
import { TextareaField } from "@/src/components/form/TextareaField";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import {
  EmployeeFormValues,
  employeeSchema,
} from "@/src/schema/employee.schema";
import {
  useAddEmployeeMutation,
  useEditEmployeeMutation,
  useGetSingleEmployeeMutation,
} from "@/src/store/action";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Contact,
  Info,
  Loader2,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const page = () => {
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();
  const [editEmployee, { isLoading: isEditLoading }] =
    useEditEmployeeMutation();
  const router = useRouter();
  const params = useParams();
  console.log("params", params);
  const [getSingleEmployee, { isLoading: isGetSingleEmployeeLoading }] =
    useGetSingleEmployeeMutation();

  const data = useSelector((state: any) => state.employee.data[0]);
  console.log("data", data);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      profilePicture: "",
      email: "",
      phoneNumber: "",
      panNumber: "",
      aadhaarNumber: "",
      address: "",
      role: "employee",
      isActive: true,
    },
  });

  useEffect(() => {
    if (params?.employeeId && params?.employeeId !== "add") {
      getSingleEmployee(params.employeeId as string);
    }
  }, [params?.employeeId, getSingleEmployee]);

  useEffect(() => {
    if (params?.employeeId === "add") {
      form.reset();
      return;
    }

    if (!data?.user) return;

    const user = data.user;

    form.reset({
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      profilePicture: user.profilePicture ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
      panNumber: user.panNumber ?? "",
      aadhaarNumber: user.aadhaarNumber ?? "",
      address: user.address ?? "",
      role: user.role?.name ?? "",
      isActive: user.isActive ?? true,
    });
  }, [data, params?.employeeId, form]);

  const handleSubmit = async (formData: EmployeeFormValues) => {
    const payload: Record<string, any> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        payload[key] = value;
      }
    });

    try {
      const res =
        params?.employeeId !== "add"
          ? await editEmployee({
              employeeId: params.employeeId as string,
              body: payload,
            }).unwrap()
          : await addEmployee(payload).unwrap();

      Toast(res);

      if (params?.employeeId === "add") {
        form.reset();
      }

      router.push("/employees");
    } catch (err: any) {
      Toast({ error: err }, "error");
    }
  };

  if (isLoading || isEditLoading || isGetSingleEmployeeLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={params?.employeeId === "new" ? "Add Employee" : "Edit Employee"}
        description={
          params?.employeeId === "new"
            ? "Add employees and their roles."
            : "Edit employee information and roles."
        }
      />
      <Form {...form}>
        <form
          id="employee-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="relative"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row gap-6">
              <Card className="border-slate-200 shadow-sm flex-6">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <User className="size-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Personal Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputField
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="e.g. John"
                      required
                    />
                    <InputField
                      control={form.control}
                      name="middleName"
                      label="Middle Name"
                      placeholder="e.g. Quincy"
                    />
                    <InputField
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 block">
                      Profile Picture
                    </span>
                    <AvatarUpload
                      value={form.watch("profilePicture") ?? ""}
                      onChange={(url) => form.setValue("profilePicture", url, { shouldDirty: true })}
                      firstName={form.watch("firstName")}
                      lastName={form.watch("lastName")}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm flex-4">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100  rounded-lg">
                      <ShieldCheck className="size-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Account Status
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <SelectField
                    control={form.control}
                    name="role"
                    label="Role"
                    placeholder="Select a role"
                    options={[
                      // { value: "admin", label: "Admin" },
                      { value: "employee", label: "Employee" },
                    ]}
                    required
                  />
                  <SwitchField
                    control={form.control}
                    name="isActive"
                    label="Is Active"
                    description="Enable access to portal"
                  />

                  <div className="rounded-xl bg-blue-50 p-4 flex gap-3 text-sm text-blue-800">
                    <Info className="size-5 shrink-0 text-blue-600 mt-0.5" />
                    <p>
                      {
                        "Adding this employee will automatically trigger a welcome email with onboarding instructions and temporary credentials."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Contact className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Identification & Contact
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    control={form.control}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="j.doe@company.com"
                    required
                  />
                  <InputField
                    control={form.control}
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    control={form.control}
                    name="panNumber"
                    label="PAN Number"
                    placeholder="ABCDE1234F"
                    description="Format: 5 letters, 4 digits, 1 letter"
                  />
                  <InputField
                    control={form.control}
                    name="aadhaarNumber"
                    label="Aadhaar Number"
                    placeholder="0000 0000 0000"
                    description="Format: 12-digit identification number"
                  />
                </div>

                <TextareaField
                  control={form.control}
                  name="address"
                  label="Residential Address"
                  placeholder="Street, City, State, ZIP Code"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 h-10 border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 h-10 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isLoading ? "Saving..." : "Save Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default page;
