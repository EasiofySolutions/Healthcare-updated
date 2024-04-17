import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "./context/UserAuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user,loading } = useUserAuth();
  const roleFromLocalStorage = localStorage.getItem("role");

  if (loading) {
    // Optionally, implement a more robust loading indicator
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
        <p>Please wait...</p>
      </div>
      )
  }

  if (!user) {
    return <Navigate to="/" />;
} else if (allowedRoles && !allowedRoles.includes(roleFromLocalStorage)) {
    return <Navigate to="/unauthorized" />;
}

  return children;
};

export default ProtectedRoute;
