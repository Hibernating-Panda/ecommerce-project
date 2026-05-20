import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { roleThemes } from "../../theme/roleThemes";

export default function AdminProfile() {
  const theme = roleThemes.admin;
  const { updateAuthUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image: "",
    password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/profile");

      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
        profile_image: response.data.profile_image || "",
        password: "",
      });
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        profile_image: formData.profile_image,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await api.put("/admin/profile", payload);

      updateAuthUser(response.data.user);

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.log(error.response?.data || error);

      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(error.response?.data?.message || "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Admin</p>
          <h1 style={styles.title}>Admin Profile</h1>
          <p style={styles.subtitle}>
            Update your personal information and profile image.
          </p>
        </div>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.profileGrid}>
        <div style={styles.previewCard}>
          <div style={{ ...styles.profileImageBox, borderColor: theme.primaryLight }}>
            {formData.profile_image ? (
              <img
                src={formData.profile_image}
                alt="Admin profile"
                style={styles.profileImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  ...styles.profileInitial,
                  backgroundColor: theme.primaryLight,
                  color: theme.primaryDark,
                }}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}
          </div>

          <h2 style={styles.previewName}>{formData.name || "Admin"}</h2>
          <p style={{ ...styles.previewRole, color: theme.primary }}>
            Administrator
          </p>

          <div style={styles.previewInfo}>
            <p>
              <strong>Email:</strong> {formData.email || "-"}
            </p>
            <p>
              <strong>Phone:</strong> {formData.phone || "-"}
            </p>
          </div>
        </div>

        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Edit Profile</h2>

          <form onSubmit={updateProfile}>
            <div style={styles.formGrid}>
              <InputGroup
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <InputGroup
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <InputGroup
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Example: 012345678"
              />

              <InputGroup
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />

              <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Profile Image URL</label>
                <input
                  type="text"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://example.com/profile.jpg"
                />
                <p style={styles.hint}>Use an image URL for now.</p>
              </div>

              <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="4"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ ...styles.saveButton, backgroundColor: theme.primary }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </div>
  );
}

const styles = {
  page: {
    padding: "clamp(16px, 2.5vw, 28px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "20px",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    color: "#111827",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 320px) minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
  },
  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
    textAlign: "center",
  },
  profileImageBox: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #fee2e2",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  profileInitial: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "52px",
    fontWeight: "900",
  },
  previewName: {
    margin: "0 0 6px",
    color: "#111827",
  },
  previewRole: {
    margin: 0,
    fontWeight: "800",
  },
  previewInfo: {
    marginTop: "20px",
    textAlign: "left",
    color: "#374151",
    lineHeight: "1.7",
    overflowWrap: "anywhere",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
    minWidth: 0,
  },
  formTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#111827",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#374151",
  },
  input: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  hint: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
  },
  saveButton: {
    padding: "11px 18px",
    borderRadius: "10px",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
  },
};