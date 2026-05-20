import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleThemes = {
  admin: {
    primary: "#dc2626",
    primaryDark: "#991b1b",
    primaryLight: "#fee2e2",
    label: "Admin",
    backPath: "/admin/dashboard",
    backText: "Go Back to Admin Dashboard",
  },
  shop_owner: {
    primary: "#2563eb",
    primaryDark: "#1e40af",
    primaryLight: "#dbeafe",
    label: "Shop Owner",
    backPath: "/shopowner/dashboard",
    backText: "Go Back to Shop Dashboard",
  },
  delivery_man: {
    primary: "#facc15",
    primaryDark: "#854d0e",
    primaryLight: "#fef9c3",
    label: "Delivery Man",
    backPath: "/delivery/dashboard",
    backText: "Go Back to Delivery Dashboard",
  },
  user: {
    primary: "#16a34a",
    primaryDark: "#166534",
    primaryLight: "#dcfce7",
    label: "Customer",
    backPath: "/customer/dashboard",
    backText: "Go Back to Customer Dashboard",
  },
  customer: {
    primary: "#16a34a",
    primaryDark: "#166534",
    primaryLight: "#dcfce7",
    label: "Customer",
    backPath: "/customer/dashboard",
    backText: "Go Back to Customer Dashboard",
  },
};

function Unauthorized() {
  const { user } = useAuth();

  const theme = roleThemes[user?.role] || {
    primary: "#111827",
    primaryDark: "#111827",
    primaryLight: "#f3f4f6",
    label: "Unknown",
    backPath: "/",
    backText: "Go Back Home",
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.iconBox, backgroundColor: theme.primaryLight }}>
          <span style={{ ...styles.icon, color: theme.primaryDark }}>!</span>
        </div>

        <h1 style={{ ...styles.code, color: theme.primary }}>403</h1>
        <h2 style={styles.title}>Unauthorized Access</h2>

        <p style={styles.text}>
          You do not have permission to access this page.
        </p>

        <p style={styles.roleText}>
          Current role: <strong>{theme.label}</strong>
        </p>

        <Link
          to={theme.backPath}
          style={{
            ...styles.button,
            backgroundColor: theme.primary,
            color: user?.role === "delivery_man" ? "#111827" : "#ffffff",
          }}
        >
          {theme.backText}
        </Link>

        <Link to="/" style={styles.homeLink}>
          Go to Home Page
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
    background:
      "radial-gradient(circle at top left, rgba(22,163,74,0.08), transparent 30%), #f9fafb",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "clamp(26px, 5vw, 42px)",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
    width: "100%",
    maxWidth: "460px",
    border: "1px solid #e5e7eb",
  },
  iconBox: {
    width: "74px",
    height: "74px",
    borderRadius: "50%",
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: "42px",
    fontWeight: "900",
    lineHeight: 1,
  },
  code: {
    fontSize: "clamp(56px, 12vw, 76px)",
    margin: "0",
    fontWeight: "900",
  },
  title: {
    margin: "8px 0 10px",
    color: "#111827",
    fontSize: "clamp(22px, 5vw, 28px)",
  },
  text: {
    margin: "0 0 10px",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  roleText: {
    margin: "0 0 24px",
    color: "#374151",
    fontSize: "14px",
  },
  button: {
    display: "inline-block",
    padding: "12px 20px",
    textDecoration: "none",
    borderRadius: "12px",
    fontWeight: "900",
    marginBottom: "14px",
  },
  homeLink: {
    display: "block",
    color: "#6b7280",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
  },
};

export default Unauthorized;