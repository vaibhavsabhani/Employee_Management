import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders }),
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params?: { page?: number; limit?: number }) => ({
        url: "/notifications",
        method: "GET",
        params,
      }),
    }),
    markRead: builder.mutation({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
    }),
    markAllRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useLazyGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
