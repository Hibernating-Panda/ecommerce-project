import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const CustomerSettingsPage = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.new_password !== form.new_password_confirmation) {
      setMessage("New password and confirmation password do not match.");
      return;
    }

    setMessage("Security update function is ready. Connect API when backend is ready.");
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Account Security</h1>
            <p style={styles.subtitle}>
              Manage your password and account security settings.
            </p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <form style={styles.card} onSubmit={handleSubmit}>
          {message && <div style={styles.message}>{message}</div>}

          <FormGroup
            label="Current Password"
            name="current_password"
            type="password"
            value={form.current_password}
            onChange={handleChange}
          />

          <FormGroup
            label="New Password"
            name="new_password"
            type="password"
            value={form.new_password}
            onChange={handleChange}
          />

          <FormGroup
            label="Confirm New Password"
            name="new_password_confirmation"
            type="password"
            value={form.new_password_confirmation}
            onChange={handleChange}
          />

          <button style={styles.primaryButton} type="submit">
            Update Password
          </button>
        </form>
      </main>
    </div>
  );
};

function FormGroup({ label, name, value, onChange, type = "text" }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
  },

  main: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "28px 20px 50px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
  },

  title: {
    margin: 0,
    fontSize: 32,
    color: COLORS.dark,
  },

  subtitle: {
    margin: "6px 0 0",
    color: COLORS.muted,
  },

  backButton: {
    background: COLORS.white,
    color: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  message: {
    background: "#fff0f1",
    color: COLORS.primary,
    border: "1px solid #fecdd3",
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 700,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },

  label: {
    color: COLORS.dark,
    fontWeight: 800,
    fontSize: 14,
  },

  input: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
  },

  primaryButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default CustomerSettingsPage;