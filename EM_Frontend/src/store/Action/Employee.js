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

  tagTypes: ["Employee"],

  endpoints: (builder) => ({
    addEmployee: builder.mutation({
      query: (data) => ({
        url: "/employee/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Employee"],
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
          url: `/employee?${params.toString()}`,
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

    getEmployeeById: builder.query({
      query: (id) => ({
        url: `/employee/${id}`,
        method: "GET",
      }),
      providesTags: ["Employee"],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, data }) => ({
        url: `/employee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Employee"],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useAddEmployeeMutation,
  useGetEmployeesQuery,
  useLazyGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
