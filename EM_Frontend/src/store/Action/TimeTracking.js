import { API_HOST } from "@/constant/constant";
import { cleanParams, commonHeaders } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const timeTrackingApi = createApi({
  reducerPath: "timeTrackingApi",

  baseQuery: fetchBaseQuery({
    baseUrl: API_HOST,
    prepareHeaders: commonHeaders,
  }),

  tagTypes: ["TimeEntry"],

  endpoints: (builder) => ({
    addTimeEntry: builder.mutation({
      query: (data) => ({
        url: "/time-tracking",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TimeEntry"],
    }),

    getMyTimeEntries: builder.query({
      query: ({ status, days, page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.append("status", status);
        if (days && days !== "all") params.append("days", days);
        params.append("page", String(page));
        params.append("limit", String(limit));

        return {
          url: `/time-tracking/my?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TimeEntry"],
    }),

    getAllTimeEntries: builder.query({
      query: ({ status, search, page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (status && status !== "all") params.append("status", status);
        if (search && search.trim() !== "") params.append("search", search);
        params.append("page", String(page));
        params.append("limit", String(limit));

        return {
          url: `/time-tracking?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TimeEntry"],
    }),

    approveTimeEntry: builder.mutation({
      query: (id) => ({
        url: `/time-tracking/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["TimeEntry"],
    }),

    rejectTimeEntry: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/time-tracking/${id}/reject`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["TimeEntry"],
    }),
  }),
});

export const {
  useAddTimeEntryMutation,
  useGetMyTimeEntriesQuery,
  useGetAllTimeEntriesQuery,
  useApproveTimeEntryMutation,
  useRejectTimeEntryMutation,
} = timeTrackingApi;
