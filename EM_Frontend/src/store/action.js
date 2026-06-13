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

import {
  useAddTimeEntryMutation,
  useGetMyTimeEntriesQuery,
  useGetAllTimeEntriesQuery,
  useApproveTimeEntryMutation,
  useRejectTimeEntryMutation,
} from "./Action/TimeTracking";

export {
  useLoginMutation,
  useLogoutMutation,
  useAddEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeByIdMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetEmployeesQuery,
  useGetUserDataMutation,
  useAddTimeEntryMutation,
  useGetMyTimeEntriesQuery,
  useGetAllTimeEntriesQuery,
  useApproveTimeEntryMutation,
  useRejectTimeEntryMutation,
};
