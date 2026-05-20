import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const COLORS = {
  primary: "#16a34a",
  primaryDark: "#166534",
  primaryLight: "#dcfce7",
  dark: "#111827",
  muted: "#6b7280",
  border: "#bbf7d0",
  softBorder: "#e5e7eb",
  bg: "#f0fdf4",
  white: "#ffffff",
  errorBg: "#fee2e2",
  errorText: "#991b1b",
};

const CustomerSettingsPage = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState({
    text: "",
    type: "success",
  });

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({ text: "", type: "success" });
    }, 3000);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.current_password || !form.new_password || !form.new_password_confirmation) {
      showMessage("Please fill in all password fields.", "error");
      return;
    }

    if (form.new_password.length < 6) {
      showMessage("New password must be at least 6 characters.", "error");
      return;
    }

    if (form.new_password !== form.new_password_confirmation) {
      showMessage("New password and confirmation password do not match.", "error");
      return;
    }

    showMessage("Security update function is ready. Connect API when backend is ready.");
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Customer</p>
            <h1 style={styles.title}>Account Security</h1>
            <p style={styles.subtitle}>
              Manage your password and account security settings.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/customer/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <form style={styles.card} onSubmit={handleSubmit}>
          {message.text && (
            <div
              style={{
                ...styles.message,
                ...(message.type === "error" ? styles.errorMessage : styles.successMessage),
              }}
            >
              {message.text}
            </div>
          )}

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

          <button type="submit" style={styles.primaryButton}>
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
    width: "100%",
    maxWidth: 760,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.primary,
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
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
    padding: "clamp(18px, 3vw, 24px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  message: {
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 700,
  },
  successMessage: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
  },
  errorMessage: {
    background: COLORS.errorBg,
    color: COLORS.errorText,
    border: "1px solid #fecaca",
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
    background: COLORS.white,
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