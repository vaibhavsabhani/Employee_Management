import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {},
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotification(state, action) {
      Object.entries(action.payload).forEach(([k, v]) => {
        if (k in state) state[k] = v;
      });
      state.isLoading = false;
      state.error = null;
    },
    setNotificationLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setNotificationError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearNotification(state) {
      state.list = [];
      state.pagination = {};
      state.unreadCount = 0;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setNotification,
  setNotificationLoading,
  setNotificationError,
  clearNotification,
} = notificationSlice.actions;
export default notificationSlice.reducer;
