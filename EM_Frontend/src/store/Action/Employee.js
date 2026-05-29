import { API_HOST } from "@/constant/constant";
import { commonHeaders } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
      query: () => ({
        url: "/employee",
        method: "GET",
      }),
      providesTags: ["Employee"],
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
useGetEmployeeByIdQuery,
useUpdateEmployeeMutation,
useDeleteEmployeeMutation,
} = employeeApi;
