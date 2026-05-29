// store/slices/employeeSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
  singleEmployee: {},
  pagination: {},
  isLoading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    setEmployee(state, action) {
      Object.entries(action.payload).forEach(([key, value]) => {
        if (key in state) {
          state[key] = value;
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
      state.employees = [];
    },

    clearEmployee(state) {
      state.employees = [];
      state.singleEmployee = {};
      state.pagination = {};
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setEmployee,
  setEmployeeLoading,
  setEmployeeError,
  clearEmployee,
} = employeeSlice.actions;

export default employeeSlice.reducer;