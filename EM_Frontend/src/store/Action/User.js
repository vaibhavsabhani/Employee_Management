import { API_HOST } from "@/constant/constant";
import { commonHeaders } from "@/utils/utils";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setUserData } from "../Reducer/User";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_HOST,
        prepareHeaders: commonHeaders,
    }),
    endpoints: (builder) => ({
        getUserData: builder.mutation({
            query: () => ({
                url: "/medata",
                method: "GET"
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUserData({ userData: data?.user }));
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        })
    }),
});

export const {
    useGetUserDataMutation
} = userApi;
