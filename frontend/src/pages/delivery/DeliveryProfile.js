import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { roleThemes } from "../../theme/roleThemes";

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
  const theme = roleThemes.delivery_man;
  const { updateAuthUser } = useAuth();

  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image_url: "",
  });

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    vehicle_type: "",
    plate_number: "",
    status: "online",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [message, setMessage] = useState({
    text: "",
    type: "success",
  });

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({
        text: "",
        type: "success",
      });
    }, 3500);
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);

      const [accountRes, deliveryRes] = await Promise.all([
        api.get("/profile"),
        api.get("/delivery/profile"),
      ]);

      const accountData = accountRes.data.user || accountRes.data;
      const deliveryData = deliveryRes.data.data || deliveryRes.data;

      setAccountState(accountData);
      setProfileState(deliveryData);

      setProfilePreview(accountData?.profile_image_url || "");
      localStorage.setItem("user", JSON.stringify(accountData));

      if (typeof updateAuthUser === "function") {
        updateAuthUser(accountData);
      }
    } catch (error) {
      console.error("Fetch delivery profile error:", error.response?.data || error);
      showMessage(
        error.response?.data?.message || "Failed to load profile.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const setAccountState = (accountData) => {
    setAccount({
      name: accountData?.name || "",
      email: accountData?.email || "",
      phone: accountData?.phone || "",
      address: accountData?.address || "",
      profile_image_url: accountData?.profile_image_url || "",
    });
  };

  const setProfileState = (deliveryData) => {
    setProfile({
      name: deliveryData?.name || "",
      phone: deliveryData?.phone || "",
      vehicle_type: deliveryData?.vehicle_type || "",
      plate_number: deliveryData?.plate_number || "",
      status: deliveryData?.status || "online",
    });
  };

  const handleAccountChange = (e) => {
    setAccount((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDeliveryChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showMessage("Profile image must be JPG, PNG, or WEBP.", "error");
      return false;
    }

    if (file.size > 4 * 1024 * 1024) {
      showMessage("Profile image must be 4MB or smaller.", "error");
      return false;
    }

    return true;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const updateAccountProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingAccount(true);

      const formData = new FormData();

      formData.append("name", account.name);
      formData.append("phone", account.phone || "");
      formData.append("address", account.address || "");

      if (profileFile) {
        formData.append("profile_image", profileFile);
      }

      formData.append("_method", "PUT");

      const res = await api.post("/profile", formData);

      const updatedUser = res.data.user || res.data;

      setAccountState(updatedUser);
      setProfilePreview(updatedUser?.profile_image_url || "");
      setProfileFile(null);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (typeof updateAuthUser === "function") {
        updateAuthUser(updatedUser);
      }

      showMessage(res.data.message || "Account profile updated successfully.");
    } catch (error) {
      console.error("Update account profile error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showMessage(errors, "error");
      } else {
        showMessage(
          error.response?.data?.message || "Failed to update account profile.",
          "error"
        );
      }
    } finally {
      setSavingAccount(false);
    }
  };

  const updateDeliveryProfile = async (e) => {
    e.preventDefault();

    try {
      setSavingDelivery(true);

      const res = await api.put("/delivery/profile", profile);
      const updatedProfile = res.data.data || res.data.profile || res.data;

      setProfileState(updatedProfile);

      showMessage(res.data.message || "Delivery profile updated successfully.");
    } catch (error) {
      console.error("Update delivery profile error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showMessage(errors, "error");
      } else {
        showMessage(
          error.response?.data?.message || "Failed to update delivery profile.",
          "error"
        );
      }
    } finally {
      setSavingDelivery(false);
    }
  };

  if (loading) {
    return <div style={styles.box}>Loading delivery profile...</div>;
  }

  return (
    <div style={styles.wrapper}>
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

      <div style={styles.box}>
        <div style={styles.header}>
          <div>
            <p style={{ ...styles.kicker, color: theme.primaryDark }}>
              Delivery Man
            </p>
            <h2 style={styles.heading}>Account Profile</h2>
            <p style={styles.subtext}>
              Update your account information and profile image.
            </p>
          </div>

          <div style={styles.avatar}>
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Delivery profile"
                style={styles.avatarImage}
              />
            ) : (
              (account.name || "D").charAt(0).toUpperCase()
            )}
          </div>
        </div>

        <form onSubmit={updateAccountProfile} style={styles.form}>
          <div style={styles.profileUploadArea}>
            <div style={styles.uploadBox}>
              <label style={styles.label}>Upload Profile Image</label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfileImageChange}
                style={styles.fileInput}
              />

              <p style={styles.helpText}>Accepted: JPG, PNG, WEBP. Max 4MB.</p>
            </div>
          </div>

          <FormGroup
            label="Name"
            name="name"
            value={account.name || ""}
            onChange={handleAccountChange}
            placeholder="Your name"
          />

          <FormGroup
            label="Email"
            name="email"
            value={account.email || ""}
            onChange={handleAccountChange}
            placeholder="Email"
            disabled
          />

          <FormGroup
            label="Phone"
            name="phone"
            value={account.phone || ""}
            onChange={handleAccountChange}
            placeholder="Phone number"
          />

          <FormGroup
            label="Address"
            name="address"
            value={account.address || ""}
            onChange={handleAccountChange}
            placeholder="Address"
          />

          <button
            style={{
              ...styles.button,
              background: theme.primaryDark,
              color: theme.primaryLight,
              opacity: savingAccount ? 0.7 : 1,
            }}
            type="submit"
            disabled={savingAccount}
          >
            {savingAccount ? "Saving Account..." : "Save Account Profile"}
          </button>
        </form>
      </div>

      <div style={styles.box}>
        <div style={styles.header}>
          <div>
            <p style={{ ...styles.kicker, color: theme.primaryDark }}>
              Delivery Information
            </p>
            <h2 style={styles.heading}>Delivery Profile</h2>
            <p style={styles.subtext}>
              Update your delivery vehicle information and working status.
            </p>
          </div>
        </div>

        <form onSubmit={updateDeliveryProfile} style={styles.form}>
          <FormGroup
            label="Display Name"
            name="name"
            value={profile.name || ""}
            onChange={handleDeliveryChange}
            placeholder="Delivery name"
          />

          <FormGroup
            label="Delivery Phone"
            name="phone"
            value={profile.phone || ""}
            onChange={handleDeliveryChange}
            placeholder="Phone number"
          />

          <div style={styles.group}>
            <label style={styles.label}>Vehicle Type</label>

            <select
              style={styles.input}
              name="vehicle_type"
              value={profile.vehicle_type || ""}
              onChange={handleDeliveryChange}
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
            onChange={handleDeliveryChange}
            placeholder="Example: 2AB-1234"
          />

          <div style={styles.group}>
            <label style={styles.label}>Status</label>

            <select
              style={styles.input}
              name="status"
              value={profile.status || "online"}
              onChange={handleDeliveryChange}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <button
            style={{ 
              ...styles.button,
              background: theme.primaryDark,
              color: theme.primaryLight,
              opacity: savingDelivery ? 0.7 : 1,
            }}
            type="submit"
            disabled={savingDelivery}
          >
            {savingDelivery ? "Saving Delivery..." : "Save Delivery Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormGroup({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div style={styles.group}>
      <label style={styles.label}>{label}</label>

      <input
        style={{
          ...styles.input,
          ...(disabled ? styles.disabledInput : {}),
        }}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: 900,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  box: {
    background: COLORS.white,
    borderRadius: 18,
    padding: "clamp(16px, 2.5vw, 22px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
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
    width: 78,
    height: 78,
    borderRadius: "50%",
    background: COLORS.primary,
    color: COLORS.dark,
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
    display: "block",
  },

  profileUploadArea: {
    gridColumn: "1 / -1",
  },

  uploadBox: {
    background: "#fffbeb",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
  },

  fileInput: {
    width: "100%",
    padding: "12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    background: COLORS.white,
    boxSizing: "border-box",
  },

  helpText: {
    margin: "8px 0 0",
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
  },

  message: {
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "pre-line",
  },

  successMessage: {
    background: COLORS.greenBg,
    color: COLORS.greenText,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bbf7d0",
  },

  errorMessage: {
    background: COLORS.redBg,
    color: COLORS.redText,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fecaca",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    outline: "none",
    fontSize: 14,
    background: COLORS.white,
  },

  disabledInput: {
    background: "#f9fafb",
    color: COLORS.muted,
    cursor: "not-allowed",
  },

  button: {
    gridColumn: "1 / -1",
    border: "none",
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    marginTop: 8,
  },
};

export default DeliveryProfile;