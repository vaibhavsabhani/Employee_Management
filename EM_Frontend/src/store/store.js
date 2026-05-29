import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./Action/auth";
import employeeSlice from "@/store/reducer";
import { employeeApi } from "./Action/Employee";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    employees: employeeSlice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, employeeApi.middleware),
});
