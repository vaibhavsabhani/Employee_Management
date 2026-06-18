import { API_HOST } from "@/constant/constant";
import { cleanParams, commonHeaders } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  setEmployee,
  setEmployeeError,
  setEmployeeLoading,
} from "../Reducer/Employee";

export const employeeApi = createApi({
  reducerPath: "employeeApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_HOST,
    prepareHeaders: commonHeaders,
  }),

  endpoints: (builder) => ({
    addEmployee: builder.mutation({
      query: (data) => ({
        url: "/user",
        method: "POST",
        body: data,
      }),
    }),

    getEmployees: builder.query({
      query: ({ filters = {}, page = 1, limit = 10, offset } = {}) => {
        const cleanedFilters = cleanParams(filters);

        if (offset === undefined || offset === null) {
          offset = (page - 1) * limit;
        }

        const params = new URLSearchParams();

        Object.entries(cleanedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });

        params.append("offset", String(offset));
        params.append("limit", String(limit));

        return {
          url: `/user?${params.toString()}`,
          method: "GET",
        };
      },

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setEmployeeLoading());

        try {
          const response = await queryFulfilled;

          const payload = response.data || {};

          dispatch(
            setEmployee({
              data: payload.users || payload.data || [],
              total: payload.total || 0,
            }),
          );
        } catch (e) {
          console.log(">>>>>setEmployee error", e);

          dispatch(setEmployeeError(e?.message || "Failed to load employee"));
        }
      },
    }),

    getEmployeeById: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: ["Employee"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(setEmployeeLoading());

        try {
          const response = await queryFulfilled;
          dispatch(
            setEmployee({
              singleEmployee: response?.data || [],
            }),
          );
        } catch (e) {
          console.log(">>>>>setEmployee error", e);
          dispatch(setEmployeeError(e?.message || "Failed to load employee"));
        }
      },
    }),

    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddEmployeeMutation,
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
  useGetEmployeeByIdMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
