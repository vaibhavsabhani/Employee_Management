import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders }),
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<any, void>({
      query: () => ({ url: "/dashboard/admin", method: "GET" }),
    }),
    getEmployeeDashboard: builder.query<any, void>({
      query: () => ({ url: "/dashboard/employee", method: "GET" }),
    }),
  }),
});

export const { useGetAdminDashboardQuery, useGetEmployeeDashboardQuery } =
  dashboardApi;
