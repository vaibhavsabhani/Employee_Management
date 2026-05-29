import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "./routes";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map((route) => {
          if (route.redirect) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Navigate to={route.redirect} replace />}
              />
            );
          }

          const Component = route.component;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  );
}

export default App;
