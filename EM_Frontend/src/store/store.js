import { configureStore } from '@reduxjs/toolkit'

import { authApi } from './Action/auth'
import employeesReducer from './Reducer/employeesSlice'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    employees: employeesReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
})