import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import MapPickerModal from "../../components/common/MapPickerModal";
import { roleThemes } from "../../theme/roleThemes";
import { useAuth } from "../../context/AuthContext";

function ShopProfile() {
  const theme = roleThemes.shop_owner;
  const { updateAuthUser } = useAuth();

  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image_url: "",
  });

  const [shop, setShop] = useState({
    shop_name: "",
    owner_name: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    description: "",
    shop_logo_url: "",
    aba_account_name: "",
    aba_account_number: "",
    aba_qr_url: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [shopLogoFile, setShopLogoFile] = useState(null);
  const [shopLogoPreview, setShopLogoPreview] = useState("");

  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState("");

  const [mapOpen, setMapOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingShop, setSavingShop] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchAllProfiles();
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

  const fetchAllProfiles = async () => {
    try {
      setLoading(true);

      const [accountRes, shopRes] = await Promise.all([
        api.get("/profile"),
        api.get("/shopowner/profile"),
      ]);

      const accountData = accountRes.data.user || accountRes.data;
      const shopData = shopRes.data.shop || shopRes.data;

      setAccountState(accountData);
      setShopState(shopData);

      setProfilePreview(accountData?.profile_image_url || "");
      setShopLogoPreview(shopData?.shop_logo_url || shopData?.logo_url || "");
      setQrPreview(shopData?.aba_qr_url || "");

      localStorage.setItem("user", JSON.stringify(accountData));

      if (typeof updateAuthUser === "function") {
        updateAuthUser(accountData);
      }
    } catch (error) {
      console.error("Fetch profile error:", error.response?.data || error);

      showPopup(
        "error",
        "Load Failed",
        error.response?.data?.message || "Failed to load profile data."
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

  const setShopState = (shopData) => {
    setShop({
      shop_name: shopData?.shop_name || "",
      owner_name: shopData?.owner_name || "",
      phone: shopData?.phone || "",
      address: shopData?.address || "",
      latitude: shopData?.latitude || "",
      longitude: shopData?.longitude || "",
      description: shopData?.description || "",
      shop_logo_url: shopData?.shop_logo_url || shopData?.logo_url || "",
      aba_account_name: shopData?.aba_account_name || "",
      aba_account_number: shopData?.aba_account_number || "",
      aba_qr_url: shopData?.aba_qr_url || "",
    });
  };

  const handleAccountChange = (e) => {
    setAccount((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleShopChange = (e) => {
    setShop((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateImage = (file, label) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showPopup("error", "Invalid File", `${label} must be JPG, PNG, or WEBP.`);
      return false;
    }

    if (file.size > 4 * 1024 * 1024) {
      showPopup("error", "File Too Large", `${label} must be 4MB or smaller.`);
      return false;
    }

    return true;
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "Profile image")) {
      e.target.value = "";
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleShopLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "Shop logo")) {
      e.target.value = "";
      return;
    }

    setShopLogoFile(file);
    setShopLogoPreview(URL.createObjectURL(file));
  };

  const handleQrChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "ABA QR image")) {
      e.target.value = "";
      return;
    }

    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const clearShopLocation = () => {
    setShop((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setSavingAccount(true);

    try {
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

      showPopup(
        "success",
        "Account Updated",
        res.data.message || "Owner account profile updated successfully."
      );
    } catch (error) {
      console.error("Update account error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showPopup("error", "Validation Error", errors);
      } else {
        showPopup(
          "error",
          "Update Failed",
          error.response?.data?.message || "Failed to update account profile."
        );
      }
    } finally {
      setSavingAccount(false);
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setSavingShop(true);

    try {
      const formData = new FormData();

      Object.entries({
        shop_name: shop.shop_name,
        owner_name: shop.owner_name,
        phone: shop.phone,
        address: shop.address,
        latitude: shop.latitude,
        longitude: shop.longitude,
        description: shop.description,
        aba_account_name: shop.aba_account_name,
        aba_account_number: shop.aba_account_number,
      }).forEach(([key, value]) => {
        formData.append(key, value || "");
      });

      if (shopLogoFile) {
        formData.append("shop_logo", shopLogoFile);
      }

      if (qrFile) {
        formData.append("aba_qr_image", qrFile);
      }

      const res = await api.post("/shopowner/profile", formData);

      const updatedShop = res.data.shop || res.data;

      setShopState(updatedShop);
      setShopLogoPreview(updatedShop?.shop_logo_url || updatedShop?.logo_url || "");
      setQrPreview(updatedShop?.aba_qr_url || "");
      setShopLogoFile(null);
      setQrFile(null);

      showPopup(
        "success",
        "Shop Updated",
        res.data.message || "Shop profile updated successfully."
      );
    } catch (error) {
      console.error("Update shop profile error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showPopup("error", "Validation Error", errors);
      } else {
        showPopup(
          "error",
          "Update Failed",
          error.response?.data?.message || "Failed to update shop profile."
        );
      }
    } finally {
      setSavingShop(false);
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
          Manage your owner account, shop logo, shop address, map location, and
          ABA QR payment image.
        </p>
      </div>

      <form style={styles.form} onSubmit={handleAccountSubmit}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Owner Account Profile</h2>
          <p style={styles.sectionDesc}>
            This image appears in your shop owner sidebar and account profile.
          </p>

          <div style={styles.profileArea}>
            <div style={styles.profilePreviewBox}>
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Owner Profile"
                  style={styles.profileImg}
                />
              ) : (
                <div
                  style={{
                    ...styles.noProfile,
                    backgroundColor: theme.primaryLight,
                    color: theme.primaryDark,
                  }}
                >
                  {account.name ? account.name.charAt(0).toUpperCase() : "O"}
                </div>
              )}
            </div>

            <div style={styles.profileFormBox}>
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

          <div style={styles.grid}>
            <InputGroup
              label="Owner Name"
              name="name"
              value={account.name}
              onChange={handleAccountChange}
              required
            />

            <InputGroup
              label="Email"
              name="email"
              value={account.email}
              disabled
            />

            <InputGroup
              label="Phone"
              name="phone"
              value={account.phone}
              onChange={handleAccountChange}
            />

            <InputGroup
              label="Address"
              name="address"
              value={account.address}
              onChange={handleAccountChange}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.saveBtn,
              backgroundColor: theme.primary,
              opacity: savingAccount ? 0.7 : 1,
            }}
            disabled={savingAccount}
          >
            {savingAccount ? "Saving Account..." : "Save Account Profile"}
          </button>
        </section>
      </form>

      <form style={styles.form} onSubmit={handleShopSubmit}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Shop Information</h2>

          <div style={styles.logoArea}>
            <div style={styles.logoPreviewBox}>
              {shopLogoPreview ? (
                <img
                  src={shopLogoPreview}
                  alt="Shop Logo"
                  style={styles.logoImg}
                />
              ) : (
                <div
                  style={{
                    ...styles.noLogo,
                    backgroundColor: theme.primaryLight,
                    color: theme.primaryDark,
                  }}
                >
                  🏪
                </div>
              )}
            </div>

            <div style={styles.profileFormBox}>
              <label style={styles.label}>Upload Shop Logo</label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleShopLogoChange}
                style={styles.fileInput}
              />

              <p style={styles.helpText}>
                Accepted: JPG, PNG, WEBP. Max 4MB. Square image recommended.
              </p>
            </div>
          </div>

          <div style={styles.grid}>
            <InputGroup
              label="Shop Name"
              name="shop_name"
              value={shop.shop_name}
              onChange={handleShopChange}
              required
            />

            <InputGroup
              label="Owner Display Name"
              name="owner_name"
              value={shop.owner_name}
              onChange={handleShopChange}
            />

            <InputGroup
              label="Shop Phone"
              name="phone"
              value={shop.phone}
              onChange={handleShopChange}
            />

            <div style={styles.addressGroup}>
              <label style={styles.label}>Shop Address</label>

              <div style={styles.addressRow}>
                <input
                  style={styles.input}
                  name="address"
                  value={shop.address}
                  onChange={handleShopChange}
                  placeholder="Enter your shop address"
                />

                <button
                  type="button"
                  style={{ ...styles.mapButton, backgroundColor: theme.primary }}
                  onClick={() => setMapOpen(true)}
                >
                  Pick on Map
                </button>
              </div>

              {shop.latitude && shop.longitude ? (
                <div style={styles.locationBox}>
                  <p style={styles.locationText}>
                    Location selected: {Number(shop.latitude).toFixed(6)},{" "}
                    {Number(shop.longitude).toFixed(6)}
                  </p>

                  <button
                    type="button"
                    style={styles.clearLocationButton}
                    onClick={clearShopLocation}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <p style={styles.noLocationText}>No map location selected yet.</p>
              )}
            </div>
          </div>

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={shop.description}
              onChange={handleShopChange}
              style={styles.textarea}
            />
          </div>
        </section>

        <section
          style={{
            ...styles.paymentSection,
            borderColor: theme.border,
          }}
        >
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
              onChange={handleShopChange}
              placeholder="Example: SENG SENG LY"
            />

            <InputGroup
              label="ABA Account Number"
              name="aba_account_number"
              value={shop.aba_account_number}
              onChange={handleShopChange}
              placeholder="Example: 001 234 567"
            />
          </div>

          <div style={styles.qrArea}>
            <div style={styles.qrUploadBox}>
              <label style={styles.label}>Upload ABA QR Image</label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleQrChange}
                style={styles.fileInput}
              />

              <p style={styles.helpText}>
                Accepted: JPG, PNG, WEBP. Max 4MB. Square QR image recommended.
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
          style={{
            ...styles.saveBtn,
            backgroundColor: theme.primary,
            opacity: savingShop ? 0.7 : 1,
          }}
          disabled={savingShop}
        >
          {savingShop ? "Saving Shop..." : "Save Shop Profile"}
        </button>
      </form>

      <MapPickerModal
        open={mapOpen}
        initialLat={shop.latitude}
        initialLng={shop.longitude}
        onClose={() => setMapOpen(false)}
        onSelect={({ latitude, longitude }) => {
          setShop((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        }}
      />
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
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },

  header: {
    marginBottom: "2px",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },

  section: {
    marginBottom: "0",
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

  profileArea: {
    display: "grid",
    gridTemplateColumns: "130px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "center",
    marginBottom: "22px",
  },

  logoArea: {
    display: "grid",
    gridTemplateColumns: "130px minmax(0, 1fr)",
    gap: "18px",
    alignItems: "center",
    marginBottom: "22px",
  },

  profilePreviewBox: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    overflow: "hidden",
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: "#dbeafe",
  },

  logoPreviewBox: {
    width: "110px",
    height: "110px",
    borderRadius: "24px",
    overflow: "hidden",
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: "#dbeafe",
    background: "#f9fafb",
  },

  profileImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  noProfile: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: "900",
  },

  noLogo: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: "900",
  },

  profileFormBox: {
    minWidth: 0,
  },

  paymentSection: {
    marginTop: "24px",
    padding: "clamp(16px, 2.5vw, 20px)",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: "16px",
    background: "#f9fafb",
    marginBottom: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  addressGroup: {
    gridColumn: "1 / -1",
  },

  addressRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "10px",
    alignItems: "start",
  },

  mapButton: {
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "13px 14px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  locationBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "6px",
  },

  locationText: {
    margin: 0,
    color: "#166534",
    fontSize: "13px",
    fontWeight: "700",
  },

  noLocationText: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "700",
  },

  clearLocationButton: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "12px",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: "14px",
    padding: "16px",
  },

  fileInput: {
    width: "100%",
    padding: "12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    background: "#fff",
  },

  noQr: {
    width: "180px",
    height: "180px",
    margin: "0 auto",
    borderRadius: "12px",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
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