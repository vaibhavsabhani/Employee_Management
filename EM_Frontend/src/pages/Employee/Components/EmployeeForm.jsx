import React from "react";
import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/custom/InputField";
import SelectField from "@/components/custom/SelectField";
import UploadInput from "@/components/custom/UploadInputField";
import employeeSchema from "./EmployeeSchema";
import { ROLES } from "@/constant/roles";
import { RoleStatus } from "@/constant/constant";
import { Button } from "@/components/ui/button";

const EmployeeForm = ({ handleSubmit, isEdit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "employee",
      isActive: "active",
      profilePicture: null,
    },
  });

  const onSubmit = (data) => {
    handleSubmit(data);
  };

  return (
    <Layout>
      <div className="p-6 bg-muted/20 min-h-screen">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Employee Details</h1>

              <p className="text-muted-foreground text-sm">
                Manage professional records and employment history.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" className="py-6" disabled={isLoading}>
                Cancel
              </Button>

              <Button type="submit" className="py-6 cursor-pointer" disabled={isLoading}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Personal Information */}

          <div className="rounded-lg border bg-background">
            <div className="border-b px-5 py-4 flex justify-between">
              <h2 className="font-medium">Personal Information</h2>

              <span className="text-xs text-muted-foreground">STEP 1 OF 3</span>
            </div>

            <div className="p-5 grid md:grid-cols-3 gap-4">
              <InputField
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Julian"
                required
              />

              <InputField
                control={form.control}
                name="middleName"
                label="Middle Name"
                placeholder="Optional"
              />

              <InputField
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Montgomery"
                required
              />

              <InputField
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="john@example.com"
                required
              />

              <InputField
                control={form.control}
                name="phoneNumber"
                label="Phone Number"
                placeholder="+1 (555) 012-3456"
                required
              />
            </div>
          </div>

          {/* Account Settings */}

          <div className="rounded-lg border bg-background">
            <div className="border-b px-5 py-4 flex justify-between">
              <h2 className="font-medium">Account Settings</h2>

              <span className="text-xs text-muted-foreground">STEP 2 OF 3</span>
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-4">
              <SelectField
                control={form.control}
                name="role"
                label="Role"
                placeholder="Select Role"
                options={Object.values(ROLES).map((role) => ({
                  name: role,
                  value: role.toLowerCase(),
                }))}
                required
              />
              <SelectField
                control={form.control}
                name="isActive"
                label="Account Status"
                placeholder="Select Status"
                options={RoleStatus?.map((status) => ({
                  name: status.name,
                  value: status.value,
                }))}
                required
              />
            </div>
          </div>

          {/* Documents */}

          <div className="rounded-lg border bg-background">
            <div className="border-b px-5 py-4 flex justify-between">
              <h2 className="font-medium">Profile Picture</h2>

              <span className="text-xs text-muted-foreground">STEP 3 OF 3</span>
            </div>

            <div className="p-5">
              <UploadInput
                control={form.control}
                name="profilePicture"
                label="Upload Profile Picture"
                bottomText="Drag and drop PDF, JPG, or PNG files (Max 10MB)"
              />
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeForm;
