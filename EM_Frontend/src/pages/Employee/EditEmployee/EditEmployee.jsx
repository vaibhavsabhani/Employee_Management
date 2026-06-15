import { useUpdateEmployeeMutation } from "@/store/action";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/components/sidebar.route";
import EmployeeForm from "../Components/EmployeeForm";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const handleSubmit = (data) => {
    console.log(data);
    // send JSON body (profilePicture removed on backend)
    updateEmployee({ id, data }).then((res) => {
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to update employee.");
      } else {
        toast.success("Employee updated successfully!");
        navigate(ROUTES.EMPLOYEES);
      }
    });
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
