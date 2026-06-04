import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import MapPickerModal from "../../components/common/MapPickerModal";

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
    latitude: "",
    longitude: "",
    profile_image_url: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

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
    }, 3500);
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
        latitude: user?.latitude || "",
        longitude: user?.longitude || "",
        profile_image_url: user?.profile_image_url || "",
      });

      setProfilePreview(user?.profile_image_url || "");
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Fetch profile error:", error.response?.data || error);

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

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showMessage("Profile image must be JPG, PNG, or WEBP.", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showMessage("Profile image must be 4MB or smaller.", "error");
      e.target.value = "";
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name);
      payload.append("phone", form.phone || "");
      payload.append("address", form.address || "");
      payload.append("latitude", form.latitude || "");
      payload.append("longitude", form.longitude || "");

      if (profileFile) {
        payload.append("profile_image", profileFile);
      }

      payload.append("_method", "PUT");

      const res = await api.post("/profile", payload);

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setForm({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
        address: updatedUser?.address || "",
        latitude: updatedUser?.latitude || "",
        longitude: updatedUser?.longitude || "",
        profile_image_url: updatedUser?.profile_image_url || "",
      });

      setProfilePreview(updatedUser?.profile_image_url || "");
      setProfileFile(null);

      showMessage(res.data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showMessage(errors, "error");
      } else {
        showMessage(
          error.response?.data?.message || "Failed to update profile.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const clearLocation = () => {
    setForm((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
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
              Update your customer account information, profile image, and map
              location.
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
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  style={styles.avatarImage}
                />
              ) : (
                (form.name || "U").charAt(0).toUpperCase()
              )}
            </div>

            <div style={styles.avatarInfo}>
              <h3 style={styles.avatarName}>{form.name || "Customer"}</h3>
              <p style={styles.avatarEmail}>{form.email}</p>

              <label style={styles.uploadButton}>
                Upload Profile Image
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleProfileImageChange}
                  style={styles.hiddenFile}
                />
              </label>

              <p style={styles.helpText}>Accepted: JPG, PNG, WEBP. Max 4MB.</p>
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

            <div style={styles.formGroupFull}>
              <label style={styles.label}>Address</label>

              <div style={styles.addressRow}>
                <input
                  style={styles.input}
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your delivery address"
                />

                <button
                  type="button"
                  style={styles.mapButton}
                  onClick={() => setMapOpen(true)}
                >
                  Pick on Map
                </button>
              </div>

              {form.latitude && form.longitude ? (
                <div style={styles.locationBox}>
                  <p style={styles.locationText}>
                    Location selected: {Number(form.latitude).toFixed(6)},{" "}
                    {Number(form.longitude).toFixed(6)}
                  </p>

                  <button
                    type="button"
                    style={styles.clearLocationButton}
                    onClick={clearLocation}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <p style={styles.noLocationText}>No map location selected yet.</p>
              )}
            </div>
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

      <MapPickerModal
        open={mapOpen}
        initialLat={form.latitude}
        initialLng={form.longitude}
        onClose={() => setMapOpen(false)}
        onSelect={({ latitude, longitude }) => {
          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        }}
      />
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  card: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: "clamp(18px, 3vw, 24px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  message: {
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 700,
    whiteSpace: "pre-line",
  },

  successMessage: {
    background: COLORS.successBg,
    color: COLORS.successText,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.successBorder,
  },

  errorMessage: {
    background: COLORS.errorBg,
    color: COLORS.errorText,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.errorBorder,
  },

  avatarBox: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    background: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.softBorder,
    flexWrap: "wrap",
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: "50%",
    background: COLORS.primary,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 900,
    flexShrink: 0,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarInfo: {
    minWidth: 220,
  },

  avatarName: {
    margin: 0,
    color: COLORS.dark,
  },

  avatarEmail: {
    margin: "4px 0 10px",
    color: COLORS.muted,
    overflowWrap: "anywhere",
  },

  uploadButton: {
    display: "inline-block",
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    padding: "9px 13px",
    borderRadius: 10,
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 13,
  },

  hiddenFile: {
    display: "none",
  },

  helpText: {
    margin: "8px 0 0",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 700,
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

  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    gridColumn: "1 / -1",
  },

  label: {
    color: COLORS.dark,
    fontWeight: 800,
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    background: COLORS.white,
    width: "100%",
    boxSizing: "border-box",
  },

  disabledInput: {
    background: "#f3f4f6",
    color: COLORS.muted,
    cursor: "not-allowed",
  },

  addressRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 10,
    alignItems: "start",
  },

  mapButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  locationBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  locationText: {
    margin: 0,
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: 700,
  },

  noLocationText: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
  },

  clearLocationButton: {
    background: "#e5e7eb",
    color: COLORS.dark,
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
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