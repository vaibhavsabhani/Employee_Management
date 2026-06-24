import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";
import {
  setEmployee,
  setEmployeeLoading,
  setEmployeeError,
} from "../../reducer/employee/employee";
import { cleanParams } from "@/src/lib/cleanParams";
import { FilterQueryArg } from "@/src/types/common.types";

export const employeeApi = createApi({
  reducerPath: "employeeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders,
  }),

  endpoints: (builder) => ({
    getEmployees: builder.query<any, FilterQueryArg>({
      query: ({ filters = {}, page = 1, limit = 10, offset }) => {
        const cleanedFilters = cleanParams(filters);

        if (offset === undefined) {
          offset = (page - 1) * limit;
        }

        const params = new URLSearchParams({
          ...cleanedFilters,
          offset: offset.toString(),
          limit: limit.toString(),
        }).toString();

        return {
          url: `/user?${params}`,
          method: "GET",
        };
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setEmployeeLoading());

        try {
          const { data } = await queryFulfilled;

          dispatch(
            setEmployee({
              data: data.users,
              total: data.total,
              offset: data.offset,
              limit: data.limit,
            }),
          );
        } catch (e: any) {
          console.error(">>>>> setEmployee error", e);

          dispatch(setEmployeeError(e?.message || "Failed to load employees"));
        }
      },
    }),

    addEmployee: builder.mutation({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
    }),

    getSingleEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `/user/${employeeId}`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setEmployeeLoading());

        try {
          const { data } = await queryFulfilled;

          dispatch(
            setEmployee({
              data: [data],
              total: 1,
              offset: 0,
              limit: 1,
            }),
          );
        } catch (e: any) {
          console.error(">>>>> setEmployee error", e);

          dispatch(setEmployeeError(e?.message || "Failed to load employee"));
        }
      },
    }),

    editEmployee: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/user/${employeeId}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteEmployee: builder.mutation({
      query: (employeeId) => ({
        url: `/user/${employeeId}`,
        method: "DELETE",
      }),
    }),

    getMyProfile: builder.query({
      query: () => ({ url: "/user/me", method: "GET" }),
    }),

    updateMyProfile: builder.mutation({
      query: (body) => ({ url: "/user/me", method: "PATCH", body }),
    }),
  }),
});

export const {
  useLazyGetEmployeesQuery,
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useGetSingleEmployeeMutation,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetMyProfileQuery,
  useUpdateMyProfileMutation,
} = employeeApi;
