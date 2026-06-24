import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "@/src/lib/api/prepareHeaders";
import { BASE_URL } from "@/src/constant/constant";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    uploadProfilePicture: builder.mutation<{ success: boolean; url: string }, FormData>({
      query: (formData) => ({
        url: "/upload/profile-picture",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadProfilePictureMutation } = uploadApi;
