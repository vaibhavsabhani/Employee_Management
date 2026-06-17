import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  pagination: {},
  balance: {},
  single: {},
  isLoading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    setLeave(state, action) {
      Object.entries(action.payload).forEach(([k, v]) => {
        if (k in state) state[k] = v;
      });
      state.isLoading = false;
      state.error = null;
    },
    setLeaveLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setLeaveError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearLeave(state) {
      state.list = [];
      state.pagination = {};
      state.single = {};
      state.balance = {};
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setLeave, setLeaveLoading, setLeaveError, clearLeave } =
  leaveSlice.actions;
export default leaveSlice.reducer;
