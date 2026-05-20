import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

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
  successBg: "#ecfdf5",
  successText: "#15803d",
  successBorder: "#bbf7d0",
  errorBg: "#fef2f2",
  errorText: "#b91c1c",
  errorBorder: "#fecaca",
};

const CustomerProfilePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [message, setMessage] = useState({
    text: "",
    type: "success",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({ text: "", type: "success" });
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      const user = res.data.user;

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
      });

      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Fetch profile error:", error);

      showMessage(
        error.response?.data?.message || "Failed to load profile.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/profile", {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setForm({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
        address: updatedUser?.address || "",
      });

      showMessage(res.data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      showMessage(
        error.response?.data?.message || "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />

        <main style={styles.main}>
          <div style={styles.card}>
            <p style={styles.loadingText}>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Customer</p>
            <h1 style={styles.title}>Edit Profile</h1>
            <p style={styles.subtitle}>
              Update your customer account information.
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

        <form style={styles.card} onSubmit={handleUpdateProfile}>
          {message.text && (
            <div
              style={{
                ...styles.message,
                ...(message.type === "error"
                  ? styles.errorMessage
                  : styles.successMessage),
              }}
            >
              {message.text}
            </div>
          )}

          <div style={styles.avatarBox}>
            <div style={styles.avatar}>
              {(form.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 style={styles.avatarName}>{form.name || "Customer"}</h3>
              <p style={styles.avatarEmail}>{form.email}</p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <FormGroup
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <FormGroup
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled
            />

            <FormGroup
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Example: 012345678"
            />

            <FormGroup
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your delivery address"
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              opacity: saving ? 0.7 : 1,
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
};

function FormGroup({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder = "",
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>

      <input
        style={{
          ...styles.input,
          ...(disabled ? styles.disabledInput : {}),
        }}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
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
    maxWidth: 900,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.primary,
  },
  loadingText: {
    margin: 0,
    color: COLORS.muted,
    fontWeight: 800,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
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
    background: COLORS.successBg,
    color: COLORS.successText,
    border: `1px solid ${COLORS.successBorder}`,
  },
  errorMessage: {
    background: COLORS.errorBg,
    color: COLORS.errorText,
    border: `1px solid ${COLORS.errorBorder}`,
  },
  avatarBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    background: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    border: `1px solid ${COLORS.softBorder}`,
    flexWrap: "wrap",
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
    flexShrink: 0,
  },
  avatarName: {
    margin: 0,
    color: COLORS.dark,
  },
  avatarEmail: {
    margin: "4px 0 0",
    color: COLORS.muted,
    overflowWrap: "anywhere",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    background: COLORS.white,
  },
  disabledInput: {
    background: "#f3f4f6",
    color: COLORS.muted,
    cursor: "not-allowed",
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