import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/custom/InputField";
import SelectField from "@/components/custom/SelectField";
import employeeSchema from "./EmployeeSchema";
import { ROLES } from "@/constant/roles";
import { RoleStatus } from "@/constant/constant";
import { Button } from "@/components/ui/button";
import { useGetEmployeeByIdMutation } from "@/store/action";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { ROUTES } from "@/components/sidebar.route";

const EmployeeForm = ({ handleSubmit, isEdit, isLoading }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [getEmployeeById, { isLoading: isEmployeeLoading }] =
    useGetEmployeeByIdMutation();
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "employee",
      isActive: false,
    },
  });

  useEffect(() => {
    if (isEdit) {
      getEmployeeById(id).then((res) => {
        console.log(res);
        if (res?.data) {
          const employeeData = res.data?.user;
          console.log(employeeData);
          form.reset({
            firstName: employeeData.firstName,
            middleName: employeeData.middleName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            phoneNumber: employeeData.phoneNumber,
            role: employeeData.role,
            isActive: employeeData.isActive ? "active" : "inactive",
          });
        }
      });
    }
  }, [id]);

  const onSubmit = (data) => {
    data.isActive = data.isActive === "active" ? true : false;
    handleSubmit(data);
  };

  if (isEmployeeLoading && isEdit) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="bg-muted/20">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" mx-auto space-y-6"
        >
          {/* Header */}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Employee Details</h1>

              <p className="text-muted-foreground text-sm">
                Manage professional records and employment history.
              </p>
            </div>

            <div className="sm:flex hidden gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => navigate(ROUTES.EMPLOYEES)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isLoading}
              >
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
              <p className="text-sm text-slate-500">
                Profile pictures are no longer collected.
              </p>
            </div>
          </div>

          <div className="sm:hidden flex justify-center gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => navigate(ROUTES.EMPLOYEES)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EmployeeForm;
