import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "./routes";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import RoleGuard from "./components/common/RoleGuard";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map((route) => {
          const Component = route.component;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={route.allowedRoles}>
                      <Component />
                    </RoleGuard>
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
