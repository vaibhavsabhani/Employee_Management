import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map((r) => {
          if (r.redirect) {
            return <Route key={r.path} path={r.path} element={<Navigate to={r.redirect} replace />} />
          }

          const LazyComp = React.lazy(() => import(`./pages/${r.component}.jsx`))

          return (
            <Route
              key={r.path}
              path={r.path}
              element={
                r.protected ? (
                  <ProtectedRoute>
                    <LazyComp />
                  </ProtectedRoute>
                ) : (
                  <LazyComp />
                )
              }
            />
          )
        })}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
 