import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_HOST } from "@/constant/constant";
import { commonHeaders } from "@/utils/utils";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_HOST,
    prepareHeaders: commonHeaders,
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAttendance: builder.query({
      query: ({
        employeeId,
        status,
        month,
        year,
        fromDate,
        toDate,
        page = 1,
        limit = 10,
      } = {}) => {
        const params = new URLSearchParams();
        if (employeeId) params.append("employeeId", employeeId);
        if (status) params.append("status", status);
        if (month) params.append("month", month);
        if (year) params.append("year", year);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        params.append("page", String(page));
        params.append("limit", String(limit));
        return { url: `/attendance?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Attendance"],
    }),

    getMyAttendance: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/attendance/my?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    createAttendance: builder.mutation({
      query: (data) => ({ url: "/attendance", method: "POST", body: data }),
      invalidatesTags: ["Attendance"],
    }),

    updateAttendance: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/attendance/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    deleteAttendance: builder.mutation({
      query: (id) => ({ url: `/attendance/${id}`, method: "DELETE" }),
      invalidatesTags: ["Attendance"],
    }),

    exportAttendance: builder.query({
      query: (params = {}) => ({ url: `/attendance/export`, method: "GET" }),
      providesTags: ["Attendance"],
    }),

    attendanceStatistics: builder.query({
      query: () => ({ url: `/attendance/statistics`, method: "GET" }),
      providesTags: ["Attendance"],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetMyAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useExportAttendanceQuery,
  useAttendanceStatisticsQuery,
} = attendanceApi;
