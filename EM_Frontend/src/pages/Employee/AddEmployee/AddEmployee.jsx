import React from "react";
import EmployeeForm from "../Components/EmployeeForm";
import { useAddEmployeeMutation } from "@/store/action";

const AddEmployee = () => {
  const [addEmployee, { isLoading }] = useAddEmployeeMutation();

  const handleSubmit = (data) => {
    const formData = new FormData();
    console.log(data);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    addEmployee(formData).then((response) => {
      console.log(response);
    });
  };

  return (
    <>
      <EmployeeForm handleSubmit={handleSubmit} isEdit={false} />
    </>
  );
};

export default AddEmployee;
