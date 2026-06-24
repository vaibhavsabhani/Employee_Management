import { BASE_URL } from "@/src/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";
import {
  setTimeEntry,
  setTimeEntryError,
  setTimeEntryLoading,
} from "../../reducer/time-entry/timeEntry";

export const timeEntryApi = createApi({
  reducerPath: "timeEntryApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders,
  }),

  endpoints: (builder) => ({
    addTimeEntry: builder.mutation({
      query: (body) => ({
        url: "/time-entries",
        method: "POST",
        body,
      }),
    }),

    meTimeEntries: builder.query({
      query: (params) => ({
        url: "/time-entries/me",
        method: "GET",
        params,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          dispatch(setTimeEntryLoading());
          const { data } = await queryFulfilled;
          dispatch(setTimeEntry({ data: data, isLoading: false, error: null }));
        } catch (error) {
          console.error("Error fetching meTimeEntries:", error);
          dispatch(setTimeEntryError("Failed to fetch time entries."));
        }
      },
    }),

    getTimeEntries: builder.query({
      query: (params) => ({
        url: "/time-entries",
        method: "GET",
        params,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          dispatch(setTimeEntryLoading());
          const { data } = await queryFulfilled;
          dispatch(setTimeEntry({ data: data, isLoading: false, error: null }));
        } catch (error) {
          console.error("Error fetching getTimeEntries:", error);
          dispatch(setTimeEntryError("Failed to fetch time entries."));
        }
      },
    }),

    getTimeEntry: builder.query({
      query: (id: string) => ({
        url: `/time-entries/${id}`,
        method: "GET",
      }),
    }),

    resubmitTimeEntry: builder.mutation({
      query: ({ id, ...body }: { id: string; date?: string; startTime?: string; endTime?: string; breakDuration?: number; notes?: string }) => ({
        url: `/time-entries/${id}`,
        method: "PATCH",
        body,
      }),
    }),

    updateTimeEntryStatus: builder.mutation({
      query: ({ id, statusId, rejectionReason }: { id: string; statusId: number; rejectionReason?: string }) => ({
        url: `/time-entries/${id}/status`,
        method: "PATCH",
        body: { statusId, ...(rejectionReason ? { rejectionReason } : {}) },
      }),
    }),
  }),
});

export const {
  useAddTimeEntryMutation,
  useLazyMeTimeEntriesQuery,
  useLazyGetTimeEntriesQuery,
  useLazyGetTimeEntryQuery,
  useResubmitTimeEntryMutation,
  useUpdateTimeEntryStatusMutation,
} = timeEntryApi;
