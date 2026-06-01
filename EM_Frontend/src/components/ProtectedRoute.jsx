import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from './sidebar.route'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  return children
}
