import { createSlice } from "@reduxjs/toolkit";
import employee from "../employee/employee";

interface State {
  data: string[];
  singleTimeEntry: object;
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  data: [],
  singleTimeEntry: {},
  isLoading: false,
  error: null,
};

const timeEntry = createSlice({
  name: "timeEntry",
  initialState,
  reducers: {
    setTimeEntry(state, action) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in state) {
          (state as any)[key] = value;
        }
      });
      state.isLoading = false;
      state.error = null;
    },
    setTimeEntryLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setTimeEntryError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.data = [];
    },
  },
});

export const {
  setTimeEntry,
  setTimeEntryError,
  setTimeEntryLoading,
} = timeEntry.actions;
export default timeEntry.reducer;
