import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import { roleThemes } from "../../theme/roleThemes";

function ShopProfile() {
  const theme = roleThemes.shop_owner;

  const [shop, setShop] = useState({
    shop_name: "",
    owner_name: "",
    phone: "",
    address: "",
    description: "",
    aba_account_name: "",
    aba_account_number: "",
    aba_qr_url: "",
  });

  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/shopowner/profile");
      const shopData = res.data.shop || res.data;

      setShopState(shopData);
      setQrPreview(shopData?.aba_qr_url || "");
    } catch (error) {
      console.error("Profile error:", error);
      showPopup(
        "error",
        "Load Failed",
        error.response?.data?.message || "Failed to load shop profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const setShopState = (shopData) => {
    setShop({
      shop_name: shopData?.shop_name || "",
      owner_name: shopData?.owner_name || "",
      phone: shopData?.phone || "",
      address: shopData?.address || "",
      description: shopData?.description || "",
      aba_account_name: shopData?.aba_account_name || "",
      aba_account_number: shopData?.aba_account_number || "",
      aba_qr_url: shopData?.aba_qr_url || "",
    });
  };

  const handleChange = (e) => {
    setShop((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();

      Object.entries({
        shop_name: shop.shop_name,
        owner_name: shop.owner_name,
        phone: shop.phone,
        address: shop.address,
        description: shop.description,
        aba_account_name: shop.aba_account_name,
        aba_account_number: shop.aba_account_number,
      }).forEach(([key, value]) => {
        formData.append(key, value || "");
      });

      if (qrFile) {
        formData.append("aba_qr_image", qrFile);
      }

      const res = await api.post("/shopowner/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedShop = res.data.shop || res.data;

      setShopState(updatedShop);
      setQrPreview(updatedShop?.aba_qr_url || qrPreview);
      setQrFile(null);

      showPopup(
        "success",
        "Profile Updated",
        res.data.message || "Shop profile updated successfully."
      );
    } catch (error) {
      console.error("Update profile error:", error);
      showPopup(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to update shop profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={styles.loading}>Loading profile...</p>;
  }

  return (
    <div style={styles.page}>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      <div style={styles.header}>
        <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>
        <h1 style={styles.title}>Shop Profile</h1>
        <p style={styles.desc}>
          Update your shop information and ABA QR for online customer payments.
        </p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Shop Information</h2>

          <div style={styles.grid}>
            <InputGroup label="Shop Name" name="shop_name" value={shop.shop_name} onChange={handleChange} required />
            <InputGroup label="Owner Name" name="owner_name" value={shop.owner_name} onChange={handleChange} />
            <InputGroup label="Phone" name="phone" value={shop.phone} onChange={handleChange} />
            <InputGroup label="Address" name="address" value={shop.address} onChange={handleChange} />
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={shop.description}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>
        </section>

        <section style={{ ...styles.paymentSection, borderColor: theme.border }}>
          <h2 style={styles.sectionTitle}>ABA Payment QR</h2>
          <p style={styles.sectionDesc}>
            Customers scan this QR when they choose online payment. Delivery fee
            is paid separately to the delivery person.
          </p>

          <div style={styles.grid}>
            <InputGroup
              label="ABA Account Name"
              name="aba_account_name"
              value={shop.aba_account_name}
              onChange={handleChange}
              placeholder="Example: SENG SENG LY"
            />

            <InputGroup
              label="ABA Account Number"
              name="aba_account_number"
              value={shop.aba_account_number}
              onChange={handleChange}
              placeholder="Example: 001 234 567"
            />
          </div>

          <div style={styles.qrArea}>
            <div style={styles.qrUploadBox}>
              <label style={styles.label}>Upload ABA QR Image</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleQrChange}
                style={styles.fileInput}
              />

              <p style={styles.helpText}>
                Accepted: JPG, PNG, WEBP. Square QR image recommended.
              </p>
            </div>

            <div style={styles.qrPreviewBox}>
              <p style={styles.previewTitle}>QR Preview</p>

              {qrPreview ? (
                <img src={qrPreview} alt="ABA QR Preview" style={styles.qrImg} />
              ) : (
                <div style={styles.noQr}>No QR uploaded yet</div>
              )}
            </div>
          </div>
        </section>

        <button
          type="submit"
          style={{ ...styles.saveBtn, backgroundColor: theme.primary }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1100px",
  },
  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },
  header: {
    marginBottom: "24px",
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
  desc: {
    color: "#6b7280",
    marginTop: "8px",
  },
  form: {
    backgroundColor: "white",
    padding: "clamp(18px, 3vw, 28px)",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  section: {
    marginBottom: "26px",
  },
  paymentSection: {
    marginTop: "24px",
    padding: "clamp(16px, 2.5vw, 20px)",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#f9fafb",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#111827",
  },
  sectionDesc: {
    margin: "0 0 16px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
    background: "white",
  },
  textarea: {
    width: "100%",
    minHeight: "140px",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "white",
    resize: "vertical",
  },
  qrArea: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 220px",
    gap: "20px",
    alignItems: "start",
  },
  qrUploadBox: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
  },
  fileInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "white",
    boxSizing: "border-box",
  },
  helpText: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },
  qrPreviewBox: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    textAlign: "center",
  },
  previewTitle: {
    margin: "0 0 10px",
    color: "#374151",
    fontWeight: 900,
  },
  qrImg: {
    width: "180px",
    height: "180px",
    objectFit: "contain",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  noQr: {
    width: "180px",
    height: "180px",
    margin: "0 auto",
    borderRadius: "12px",
    border: "1px dashed #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontWeight: 800,
    fontSize: "14px",
    background: "#f9fafb",
  },
  saveBtn: {
    color: "white",
    border: "none",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default ShopProfile;