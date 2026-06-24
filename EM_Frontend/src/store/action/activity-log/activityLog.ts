import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";
import { BASE_URL } from "@/src/constant/constant";
import { cleanParams } from "@/src/lib/cleanParams";
import { FilterQueryArg } from "@/src/types/common.types";

export const activityLogApi = createApi({
  reducerPath: "activityLogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getActivityLogs: builder.query<any, FilterQueryArg>({
      query: ({ filters = {}, page = 1, limit = 10, offset }) => {
        const cleanedFilters = cleanParams(filters);
        if (offset === undefined) {
          offset = (page - 1) * limit;
        }
        const params = new URLSearchParams({
          ...cleanedFilters,
          offset: offset.toString(),
          limit: limit.toString(),
        }).toString();
        return { url: `/activity-log?${params}`, method: "GET" };
      },
    }),
  }),
});

export const { useLazyGetActivityLogsQuery } = activityLogApi;
