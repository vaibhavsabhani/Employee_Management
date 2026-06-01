import { useLoginMutation, useLogoutMutation } from "./Action/auth";

import {
  useAddEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeByIdMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetEmployeesQuery,
} from "./Action/Employee";

import {
  useGetUserDataMutation
} from "./Action/User"

export {
  useLoginMutation,
  useLogoutMutation,
  useAddEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeByIdMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetEmployeesQuery,
  useGetUserDataMutation
};
