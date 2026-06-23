import {
  useLoginMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
} from "@/src/store/action/auth/auth";

import {
  useLazyGetEmployeesQuery,
  useAddEmployeeMutation,
} from "@/src/store/action/employee/employee";

export {
  useLoginMutation,
  useAddEmployeeMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useLazyGetEmployeesQuery
};
