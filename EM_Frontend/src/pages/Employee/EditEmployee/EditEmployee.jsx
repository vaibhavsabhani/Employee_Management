import React from "react";
import EmployeeForm from "../Components/EmployeeForm";
import { useUpdateEmployeeMutation } from "@/store/action";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/components/sidebar.route";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const handleSubmit = (data) => {
    console.log(data);
    if (data.prolePicture?.length === 0 || data.profilePicture === null) {
      delete data.profilePicture;
    }
    {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      updateEmployee({ id, data: formData }).then((res) => {
        if (res?.error) {
          toast.error(
            res?.error?.data?.message || "Failed to update employee.",
          );
        } else {
          toast.success("Employee updated successfully!");
          navigate(ROUTES.EMPLOYEES);
        }
      });
    }
  };
  return (
    <>
      <EmployeeForm
        handleSubmit={handleSubmit}
        isEdit={true}
        isLoading={isLoading}
      />
    </>
  );
};

export default EditEmployee;
