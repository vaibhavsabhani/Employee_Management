import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./action/auth/auth";
import { employeeApi } from "./action/employee/employee";
import { employee, timeEntry, leave } from "./reducer";
import { timeEntryApi } from "./action/time-entry/timeEntry";
import { leaveApi } from "./action/leave/leave";
import { attendanceApi } from "./action/attendance/attendance";
import { notificationApi } from "./action/notification/notification";
import { dashboardApi } from "./action/dashboard/dashboard";
import { uploadApi } from "./action/upload/upload";
import { activityLogApi } from "./action/activity-log/activityLog";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [timeEntryApi.reducerPath]: timeEntryApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [activityLogApi.reducerPath]: activityLogApi.reducer,
    employee,
    timeEntry,
    leave,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      employeeApi.middleware,
      timeEntryApi.middleware,
      leaveApi.middleware,
      attendanceApi.middleware,
      notificationApi.middleware,
      dashboardApi.middleware,
      uploadApi.middleware,
      activityLogApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
