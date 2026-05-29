import React from "react";
import EmployeeForm from "../Components/EmployeeForm";
import { useAddEmployeeMutation } from "@/store/action";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    const formData = new FormData();
    console.log(data);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    addEmployee(formData).then((res) => {
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to add employee.");
      } else {
        toast.success("Employee added successfully!");
        navigate("/employees");
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
