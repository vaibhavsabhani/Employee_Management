import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./Action/auth";
import employeeSlice from "@/store/reducer";
import { employeeApi } from "./Action/Employee";
import { userApi } from "./Action/User";
import { timeTrackingApi } from "./Action/TimeTracking";
import userSlice from "./Reducer/User";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [timeTrackingApi.reducerPath]: timeTrackingApi.reducer,
    employees: employeeSlice,
    user: userSlice
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      employeeApi.middleware,
      userApi.middleware,
      timeTrackingApi.middleware
    ),
});
