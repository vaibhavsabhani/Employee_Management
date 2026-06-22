"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info, UploadCloud, User, Contact, ShieldCheck, Save, X } from "lucide-react";

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
import { SelectField } from "@/src/components/form/SelectField";
import { SwitchField } from "@/src/components/form/SwitchField";
import { TextareaField } from "@/src/components/form/TextareaField";
import { Toast } from "@/src/components/custom/Toast";

import { employeeSchema, type EmployeeFormValues } from "@/src/schema/employee.schema";

type EmployeeFormProps = {
  initialValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
};

export const EmployeeForm = ({
  initialValues,
  onSubmit,
  isLoading,
  isEdit = false,
}: EmployeeFormProps) => {
  const router = useRouter();
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([
    { label: "Software Engineer", value: "software_engineer" },
    { label: "Product Manager", value: "product_manager" },
    { label: "HR Manager", value: "hr_manager" },
    { label: "Designer", value: "designer" },
  ]);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: initialValues?.firstName || "",
      middleName: initialValues?.middleName || "",
      lastName: initialValues?.lastName || "",
      profilePicture: initialValues?.profilePicture || "",
      email: initialValues?.email || "",
      phoneNumber: initialValues?.phoneNumber || "",
      panNumber: initialValues?.panNumber || "",
      aadhaarNumber: initialValues?.aadhaarNumber || "",
      residentialAddress: initialValues?.residentialAddress || "",
      role: initialValues?.role || "",
      isActive: initialValues?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        id="employee-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="relative"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Administration</span>
              <span>›</span>
              <span className="font-medium text-slate-900">{isEdit ? "Edit Employee" : "Add New Employee"}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? "Update organizational identity record."
                : "Create a new organizational identity record in the central repository."}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              className="px-6 h-10 bg-[#0f2d6b] hover:bg-[#12357d] text-white font-semibold flex items-center gap-2"
            >
              <Save className="size-4" />
              {isEdit ? "Update Employee" : "Save Employee"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <User className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
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
                  <span className="text-sm font-medium text-slate-900 block">
                    Profile Picture
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="relative flex flex-col items-center justify-center size-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                      <UploadCloud className="size-6 mb-1" />
                      <span className="text-[10px] font-semibold tracking-wider">UPLOAD</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>Click to upload or drag and drop</p>
                      <p>SVG, PNG, JPG or GIF (max. 800x800px)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identification & Contact */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Contact className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
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
                  name="residentialAddress"
                  label="Residential Address"
                  placeholder="Street, City, State, ZIP Code"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Account Status */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <ShieldCheck className="size-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Account Status
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <SelectField
                  control={form.control}
                  name="role"
                  label="Designation / Role"
                  options={roles}
                  placeholder="Select Role"
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
                    {isEdit
                      ? "Updating this employee's status may affect their access to the portal."
                      : "Adding this employee will automatically trigger a welcome email with onboarding instructions and temporary credentials."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            {!isEdit && (
              <Card className="border-none shadow-none bg-[#0f2d6b] text-white relative overflow-hidden">
                {/* Background Icon */}
                <Contact className="absolute -bottom-6 -right-6 size-40 text-blue-800/50 rotate-12" />
                
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="text-sm font-bold tracking-wider text-blue-200 uppercase">
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-blue-300" />
                    <span className="text-sm font-medium">Verify documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-blue-300" />
                    <span className="text-sm font-medium">Assign assets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded-full border-2 border-blue-400 flex items-center justify-center" />
                    <span className="text-sm font-medium text-blue-100">Payroll enrollment</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
