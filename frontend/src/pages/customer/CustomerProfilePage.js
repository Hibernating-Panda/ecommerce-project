import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const CustomerProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later connect this to Laravel API.
    setMessage("Profile update function is ready. Connect API when backend is ready.");
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Edit Profile</h1>
            <p style={styles.subtitle}>
              Update your customer account information.
            </p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        <form style={styles.card} onSubmit={handleSubmit}>
          {message && <div style={styles.message}>{message}</div>}

          <div style={styles.avatarBox}>
            <div style={styles.avatar}>
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 style={styles.avatarName}>{user?.name || "Customer"}</h3>
              <p style={styles.avatarEmail}>{user?.email}</p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <FormGroup
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <FormGroup
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <FormGroup
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <FormGroup
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <button style={styles.primaryButton} type="submit">
            Save Changes
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
    maxWidth: 900,
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
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 700,
  },

  avatarBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    background: "#f9fafb",
    padding: 16,
    borderRadius: 16,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: "50%",
    background: COLORS.primary,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    fontWeight: 900,
  },

  avatarName: {
    margin: 0,
    color: COLORS.dark,
  },

  avatarEmail: {
    margin: "4px 0 0",
    color: COLORS.muted,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginBottom: 22,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
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

export default CustomerProfilePage;