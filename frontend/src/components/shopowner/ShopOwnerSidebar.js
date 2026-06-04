import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function ShopOwnerSidebar({ theme }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getApiBaseUrl = () => {
    const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000/api";
    return baseUrl.replace(/\/api\/?$/, "");
  };

  const normalizeImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/storage/")) {
      return `${getApiBaseUrl()}${image}`;
    }

    if (image.startsWith("storage/")) {
      return `${getApiBaseUrl()}/${image}`;
    }

    return `${getApiBaseUrl()}/storage/${image}`;
  };

  const profileImageSrc = useMemo(() => {
    return normalizeImageUrl(user?.profile_image_url || user?.profile_image || "");
  }, [user]);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "O";

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 15px",
    marginBottom: "8px",
    borderRadius: "12px",
    textDecoration: "none",
    color: isActive ? "#ffffff" : "#d1d5db",
    backgroundColor: isActive ? theme?.primary || "#2563eb" : "transparent",
    fontWeight: isActive ? "900" : "700",
  });

  return (
    <aside style={styles.sidebar}>
      <div>
        <div style={styles.brandBox}>
          <div
            style={{
              ...styles.logo,
              backgroundColor: theme?.primary || "#2563eb",
            }}
          >
            S
          </div>

          <div>
            <h2 style={styles.title}>Shop Panel</h2>
            <p style={styles.subtitle}>Shop Owner Management</p>
          </div>
        </div>

        <NavLink to="/shopowner/profile"  style={styles.userBox}>
          <div  
            style={{
              ...styles.avatar,
              backgroundColor: theme?.primaryLight || "#dbeafe",
              color: theme?.primaryDark || "#1e40af",
            }}
          >
            {profileImageSrc && !imageError ? (
              <img
                src={profileImageSrc}
                alt={user?.name || "Shop Owner"}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
              />
            ) : (
              initial
            )}
          </div>

          <div style={styles.userText}>
            <p style={styles.userName}>{user?.name || "Shop Owner"}</p>
            <p style={styles.userRole}>Shop Owner</p>
          </div>
        </NavLink>

        <nav style={styles.nav}>
          <NavLink to="/shopowner/dashboard" style={linkStyle}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/shopowner/products" style={linkStyle}>
            📦 Products
          </NavLink>

          <NavLink to="/shopowner/add-product" style={linkStyle}>
            ➕ Add Product
          </NavLink>

          <NavLink to="/shopowner/orders" style={linkStyle}>
            🧾 Orders
          </NavLink>

          <NavLink to="/shopowner/sales" style={linkStyle}>
            📈 Sales Report
          </NavLink>

          <NavLink to="/shopowner/profile" style={linkStyle}>
            🏪 Shop Profile
          </NavLink>
        </nav>
      </div>

      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "linear-gradient(180deg, #111827, #1f2937)",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflowY: "auto",
    zIndex: 1000,
  },

  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },

  logo: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "22px",
  },

  title: {
    color: "#ffffff",
    margin: 0,
    fontSize: "21px",
  },

  subtitle: {
    color: "#9ca3af",
    margin: "4px 0 0",
    fontSize: "13px",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "24px",
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  userText: {
    minWidth: 0,
  },

  userName: {
    color: "#ffffff",
    margin: 0,
    fontSize: "14px",
    fontWeight: "800",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  userRole: {
    color: "#9ca3af",
    margin: "4px 0 0",
    fontSize: "12px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
  },

  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "13px 15px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontWeight: "900",
    cursor: "pointer",
    marginTop: "24px",
  },
};

export default ShopOwnerSidebar;