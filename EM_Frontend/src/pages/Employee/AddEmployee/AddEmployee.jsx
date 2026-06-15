import React from "react";
import EmployeeForm from "../Components/EmployeeForm";
import { useAddEmployeeMutation } from "@/store/action";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/components/sidebar.route";

const AddEmployee = () => {
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    // send JSON (no file uploads)
    addEmployee(data).then((res) => {
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to add employee.");
      } else {
        toast.success("Employee added successfully!");
        navigate(ROUTES.EMPLOYEES);
      }
    });
  };

  return (
    <>
      <EmployeeForm
        handleSubmit={handleSubmit}
        isEdit={false}
        isLoading={isLoading}
      />
    </>
  );
};

export default AddEmployee;
