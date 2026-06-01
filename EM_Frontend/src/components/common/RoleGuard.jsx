// components/ProtectedRoute.jsx

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleGuard = ({ children, allowedRoles = [], redirectTo = "/unauthorized" }) => {
  const user = useSelector((state) => state.user?.userData?.role);

  let userRole = user;
  try {
    if (!userRole) {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        userRole = parsed?.role;
      }
    }
  } catch (e) {
    // ignore JSON parse errors
  }

  const token = localStorage.getItem("token");

  if (!userRole && token) {
    return children;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleGuard;