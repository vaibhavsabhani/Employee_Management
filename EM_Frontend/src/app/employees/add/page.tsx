"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "../components/EmployeeForm";
import { Toast } from "@/src/components/custom/Toast";
import { EmployeeFormValues } from "@/src/schema/employee.schema";

const AddEmployeePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EmployeeFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual mutation when API is ready
      // const res = await createEmployee(data).unwrap();
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Toast({ message: "Employee added successfully!" }, "success");
      router.push("/employees");
    } catch (error) {
      Toast({ message: "Failed to add employee. Please try again." }, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <EmployeeForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default AddEmployeePage;
