import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {},
  single: {},
  isLoading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setAttendance(state, action) {
      Object.entries(action.payload).forEach(([k, v]) => {
        if (k in state) state[k] = v;
      });
      state.isLoading = false;
      state.error = null;
    },
    setAttendanceLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setAttendanceError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearAttendance(state) {
      state.list = [];
      state.pagination = {};
      state.single = {};
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAttendance,
  setAttendanceLoading,
  setAttendanceError,
  clearAttendance,
} = attendanceSlice.actions;
export default attendanceSlice.reducer;
