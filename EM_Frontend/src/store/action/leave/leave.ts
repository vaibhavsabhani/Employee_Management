import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, prepareHeaders }),
  endpoints: (builder) => ({
    getLeaveTypes: builder.query({
      query: () => ({ url: "/leaves/types", method: "GET" }),
    }),

    addLeave: builder.mutation({
      query: (body) => ({ url: "/leaves", method: "POST", body }),
    }),

    meLeaves: builder.query({
      query: (params) => ({ url: "/leaves/me", method: "GET", params }),
    }),

    getLeaves: builder.query({
      query: (params) => ({ url: "/leaves", method: "GET", params }),
    }),

    updateLeaveStatus: builder.mutation({
      query: ({ id, statusId, rejectionReason }: { id: string; statusId: number; rejectionReason?: string }) => ({
        url: `/leaves/${id}/status`,
        method: "PATCH",
        body: { statusId, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useAddLeaveMutation,
  useLazyMeLeavesQuery,
  useLazyGetLeavesQuery,
  useUpdateLeaveStatusMutation,
} = leaveApi;
