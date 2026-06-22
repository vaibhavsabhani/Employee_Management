import { createSlice } from "@reduxjs/toolkit";

interface State {
  data: string[];
  singleEmployee: object;
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  data: [],
  singleEmployee: {},
  isLoading: false,
  error: null,
};

const employee = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmployee(state, action) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in state) {
          (state as any)[key] = value;
        }
      });
      state.isLoading = false;
      state.error = null;
    },
    setEmployeeLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setEmployeeError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.data = [];
    },
  },
});

export const {
  setEmployee,
  setEmployeeError,
  setEmployeeLoading,
} = employee.actions;
export default employee.reducer;
