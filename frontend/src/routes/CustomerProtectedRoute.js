import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CustomerProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.card}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "user") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const styles = {
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6fb",
  },

  card: {
    background: "#fff",
    padding: "20px 28px",
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    fontWeight: 700,
  },
};

export default CustomerProtectedRoute;