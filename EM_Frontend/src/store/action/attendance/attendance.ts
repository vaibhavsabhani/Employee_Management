import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders }),
  endpoints: (builder) => ({
    getAttendance: builder.query({
      query: (params) => ({ url: "/attendance", method: "GET", params }),
    }),
    markAttendance: builder.mutation({
      query: (body: { employeeId: string; date: string; statusId: number; notes?: string }) => ({
        url: "/attendance/mark",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLazyGetAttendanceQuery, useMarkAttendanceMutation } = attendanceApi;
