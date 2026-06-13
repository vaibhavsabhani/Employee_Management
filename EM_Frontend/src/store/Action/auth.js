import { API_HOST } from "@/constant/constant";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUserData } from "../Reducer/User";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_HOST}`,
  }),

  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = await queryFulfilled;
          dispatch(setUserData({ userData: response?.data?.user }));
        } catch (error) {
          console.log(error, "error");
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
