import React, { useEffect, useState } from "react";
import api from "../../api/api";
import PopupMessage from "../../components/common/PopupMessage";

function ShopProfile() {
  const [shop, setShop] = useState({
    shop_name: "",
    owner_name: "",
    phone: "",
    address: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/shopowner/profile");
      setShop(res.data);
    } catch (error) {
      console.error("Profile error:", error);
      showPopup("error", "Load Failed", "Failed to load shop profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setShop({
      ...shop,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/shopowner/profile", shop);
      setShop(res.data.shop);
      showPopup("success", "Profile Updated", "Shop profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);
      showPopup("error", "Update Failed", "Failed to update shop profile.");
    } finally {
      setSaving(false);
    }
  };

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  if (loading) {
    return <p style={styles.loading}>Loading profile...</p>;
  }

  return (
    <div>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />
      <h1 style={styles.title}>Shop Profile</h1>
      <p style={styles.desc}>Update your shop information.</p>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Shop Name</label>
            <input
              type="text"
              name="shop_name"
              value={shop.shop_name || ""}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Owner Name</label>
            <input
              type="text"
              name="owner_name"
              value={shop.owner_name || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Phone</label>
            <input
              type="text"
              name="phone"
              value={shop.phone || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={shop.address || ""}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={shop.description || ""}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        <button type="submit" style={styles.saveBtn} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  loading: {
    fontSize: "18px",
    fontWeight: "600",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginBottom: "24px",
  },
  form: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    maxWidth: "900px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "800",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    height: "140px",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  saveBtn: {
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default ShopProfile;