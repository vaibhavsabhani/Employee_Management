import { createSlice } from "@reduxjs/toolkit";

interface State {
  data: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  data: [],
  isLoading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    setLeave(state, action) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in state) (state as any)[key] = value;
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
      state.data = [];
    },
  },
});

export const { setLeave, setLeaveLoading, setLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
