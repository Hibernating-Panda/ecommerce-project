import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "shop_owner") {
    return <Navigate to="/shop" replace />;
  }

  if (user?.role === "delivery_man") {
    return <Navigate to="/delivery" replace />;
  }

  return <Navigate to="/home" replace />;
}

export default RoleRedirect;