import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

const COLORS = {
  primary: "#facc15",
  primaryDark: "#854d0e",
  primaryLight: "#fef9c3",
  dark: "#111827",
  muted: "#6b7280",
  border: "#fde68a",
  softBorder: "#e5e7eb",
  white: "#ffffff",
  greenBg: "#dcfce7",
  greenText: "#15803d",
  redBg: "#fee2e2",
  redText: "#b91c1c",
};

function DeliveryProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    vehicle_type: "",
    plate_number: "",
    status: "online",
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

  const getToken = () => localStorage.getItem("token");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({
        text: "",
        type: "success",
      });
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/delivery/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile(data.data || data);
    } catch (error) {
      console.error("Fetch delivery profile error:", error);
      showMessage(error.message || "Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/delivery/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      showMessage(data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Update delivery profile error:", error);
      showMessage(error.message || "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return <div style={styles.box}>Loading delivery profile...</div>;
  }

  return (
    <div style={styles.box}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Delivery Man</p>
          <h2 style={styles.heading}>Delivery Profile</h2>
          <p style={styles.subtext}>
            Update your delivery information and working status.
          </p>
        </div>

        <div style={styles.avatar}>
          {(profile.name || "D").charAt(0).toUpperCase()}
        </div>
      </div>

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

      <form onSubmit={updateProfile} style={styles.form}>
        <FormGroup
          label="Name"
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          placeholder="Delivery name"
        />

        <FormGroup
          label="Phone"
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
          placeholder="Phone number"
        />

        <div style={styles.group}>
          <label style={styles.label}>Vehicle Type</label>

          <select
            style={styles.input}
            name="vehicle_type"
            value={profile.vehicle_type || ""}
            onChange={handleChange}
          >
            <option value="">Select vehicle</option>
            <option value="motorbike">Motorbike</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
          </select>
        </div>

        <FormGroup
          label="Plate Number"
          name="plate_number"
          value={profile.plate_number || ""}
          onChange={handleChange}
          placeholder="Example: 2AB-1234"
        />

        <div style={styles.group}>
          <label style={styles.label}>Status</label>

          <select
            style={styles.input}
            name="status"
            value={profile.status || "online"}
            onChange={handleChange}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        <button
          style={{
            ...styles.button,
            opacity: saving ? 0.7 : 1,
          }}
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

function FormGroup({ label, name, value, onChange, placeholder }) {
  return (
    <div style={styles.group}>
      <label style={styles.label}>{label}</label>

      <input
        style={styles.input}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

const styles = {
  box: {
    background: COLORS.white,
    borderRadius: 18,
    padding: "clamp(16px, 2.5vw, 22px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    border: `1px solid ${COLORS.border}`,
    maxWidth: 820,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  kicker: {
    margin: "0 0 6px",
    color: COLORS.primaryDark,
    fontWeight: 900,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  heading: {
    margin: 0,
    color: COLORS.dark,
    fontSize: "clamp(24px, 4vw, 30px)",
  },
  subtext: {
    margin: "6px 0 0",
    color: COLORS.muted,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: COLORS.primary,
    color: COLORS.dark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 900,
    flexShrink: 0,
  },
  message: {
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 800,
  },
  successMessage: {
    background: COLORS.greenBg,
    color: COLORS.greenText,
    border: "1px solid #bbf7d0",
  },
  errorMessage: {
    background: COLORS.redBg,
    color: COLORS.redText,
    border: "1px solid #fecaca",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: 16,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: 900,
    color: COLORS.dark,
  },
  input: {
    padding: "12px 13px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    fontSize: 14,
    background: COLORS.white,
  },
  button: {
    gridColumn: "1 / -1",
    background: COLORS.primary,
    color: COLORS.dark,
    border: "none",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    marginTop: 8,
  },
};

export default DeliveryProfile;