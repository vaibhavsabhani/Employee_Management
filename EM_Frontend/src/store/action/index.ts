import {
  useLoginMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
} from "@/src/store/action/auth/auth";

import {
  useLazyGetEmployeesQuery,
  useAddEmployeeMutation,
  useGetSingleEmployeeMutation,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/src/store/action/employee/employee";

export {
  useLoginMutation,
  useAddEmployeeMutation,
  useGetSingleEmployeeMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useLazyGetEmployeesQuery,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
};
