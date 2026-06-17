import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_HOST } from "@/constant/constant";
import { commonHeaders } from "@/utils/utils";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_HOST,
    prepareHeaders: commonHeaders,
  }),
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    applyLeave: builder.mutation({
      query: (data) => ({ url: "/leaves", method: "POST", body: data }),
      invalidatesTags: ["Leave"],
    }),

    getMyLeaves: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/leaves/my?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Leave"],
    }),

    getMyBalance: builder.query({
      query: () => ({ url: "/leaves/my/balance", method: "GET" }),
      providesTags: ["Leave"],
    }),

    cancelLeave: builder.mutation({
      query: (id) => ({ url: `/leaves/${id}`, method: "DELETE" }),
      invalidatesTags: ["Leave"],
    }),

    adminGetLeaves: builder.query({
      query: ({ status, page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        params.append("page", String(page));
        params.append("limit", String(limit));
        return { url: `/leaves?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Leave"],
    }),

    getLeaveById: builder.query({
      query: (id) => ({ url: `/leaves/${id}`, method: "GET" }),
      providesTags: ["Leave"],
    }),

    approveLeave: builder.mutation({
      query: ({ id, adminComment }) => ({
        url: `/leaves/${id}/approve`,
        method: "PUT",
        body: { adminComment },
      }),
      invalidatesTags: ["Leave"],
    }),

    rejectLeave: builder.mutation({
      query: ({ id, rejectionReason, adminComment }) => ({
        url: `/leaves/${id}/reject`,
        method: "PUT",
        body: { rejectionReason, adminComment },
      }),
      invalidatesTags: ["Leave"],
    }),

    leaveStatistics: builder.query({
      query: () => ({ url: "/leaves/statistics", method: "GET" }),
      providesTags: ["Leave"],
    }),

    leaveReport: builder.query({
      query: (params = {}) => ({ url: "/leaves/report", method: "GET" }),
      providesTags: ["Leave"],
    }),
  }),
});

export const {
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useGetMyBalanceQuery,
  useCancelLeaveMutation,
  useAdminGetLeavesQuery,
  useGetLeaveByIdQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useLeaveStatisticsQuery,
  useLeaveReportQuery,
} = leaveApi;
