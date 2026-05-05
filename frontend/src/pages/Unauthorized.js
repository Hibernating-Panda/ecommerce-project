import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Unauthorized() {
  const { user } = useAuth();

  const getBackPath = () => {
    if (user?.role === "admin") {
      return "/admin";
    }

    if (user?.role === "shop_owner") {
      return "/shop";
    }

    if (user?.role === "delivery_man") {
      return "/delivery";
    }

    return "/home";
  };

  const getBackText = () => {
    if (user?.role === "admin") {
      return "Go Back to Admin Dashboard";
    }

    if (user?.role === "shop_owner") {
      return "Go Back to Shop Dashboard";
    }

    if (user?.role === "delivery_man") {
      return "Go Back to Delivery Dashboard";
    }

    return "Go Back Home";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>403</h1>
        <h2>Unauthorized Access</h2>

        <p style={styles.text}>
          You do not have permission to access this page.
        </p>

        <p style={styles.roleText}>
          Current role: <strong>{user?.role || "unknown"}</strong>
        </p>

        <Link to={getBackPath()} style={styles.button}>
          {getBackText()}
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "400px",
  },
  title: {
    fontSize: "64px",
    margin: "0",
    color: "#dc3545",
  },
  text: {
    marginBottom: "10px",
    color: "#555",
  },
  roleText: {
    marginBottom: "25px",
    color: "#777",
    fontSize: "14px",
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#222",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
};

export default Unauthorized;