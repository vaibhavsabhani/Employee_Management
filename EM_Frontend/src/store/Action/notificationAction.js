import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_HOST } from "@/constant/constant";
import { commonHeaders } from "@/utils/utils";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_HOST,
    prepareHeaders: commonHeaders,
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 50 } = {}) => ({
        url: `/notifications?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    markRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkReadMutation } =
  notificationApi;
