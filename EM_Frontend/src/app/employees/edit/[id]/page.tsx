"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { EmployeeForm } from "../../components/EmployeeForm";
import { Toast } from "@/src/components/custom/Toast";
import { EmployeeFormValues } from "@/src/schema/employee.schema";

const EditEmployeePage = () => {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] = useState<Partial<EmployeeFormValues>>({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // TODO: Replace with actual query
        // const res = await getEmployeeById(employeeId).unwrap();
        
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Mock data
        setInitialData({
          firstName: "John",
          lastName: "Doe",
          email: "j.doe@company.com",
          phoneNumber: "+1 555-0198",
          role: "software_engineer",
          isActive: true,
        });
      } catch (error) {
        Toast({ message: "Failed to fetch employee details." }, "error");
      } finally {
        setIsFetching(false);
      }
    };

    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual mutation
      // const res = await updateEmployee({ id: employeeId, data }).unwrap();
      
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Toast({ message: "Employee updated successfully!" }, "success");
      router.push("/employees");
    } catch (error) {
      Toast({ message: "Failed to update employee. Please try again." }, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-500">Loading employee details...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <EmployeeForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        isEdit={true}
        initialValues={initialData}
      />
    </div>
  );
};

export default EditEmployeePage;
