// store/slices/employeeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData: {},
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData(state, action) {
            Object.entries(action.payload).forEach(([key, value]) => {
                if (key in state) {
                    state[key] = value;
                }
            });

            state.isLoading = false;
            state.error = null;
        },

        setUserLoading(state) {
            state.isLoading = true;
            state.error = null;
        },

        setUserError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
            state.userData = {};
        },

        clearUser(state) {
            state.userData = {};
            state.error = null;
            state.isLoading = false;
        },
    },
});

export const {
    setUserData,
    setUserLoading,
    setUserError,
    clearUser,
} = userSlice.actions;

export default userSlice.reducer;