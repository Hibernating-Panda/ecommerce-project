import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "📊",
      end: true,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: "👥",
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: "📦",
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: "🏷️",
    },
  ];

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandBox}>
            <div style={styles.logo}>E</div>

            <div>
              <h2 style={styles.brandTitle}>E-Shop</h2>
              <p style={styles.brandSubtitle}>Admin Panel</p>
            </div>
          </div>

          <div style={styles.userBox}>
            <div style={styles.avatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div>
              <p style={styles.userName}>{user?.name || "Admin"}</p>
              <p style={styles.userRole}>{user?.role || "admin"}</p>
            </div>
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.bottomSection}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
  },

  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "260px",
    background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
    color: "#ffffff",
    padding: "22px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "4px 0 18px rgba(0,0,0,0.15)",
    zIndex: 1000,
    overflowY: "auto",
  },

  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },

  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    boxShadow: "0 8px 18px rgba(79,70,229,0.35)",
  },

  brandTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "0.3px",
  },

  brandSubtitle: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#9ca3af",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "24px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
  },

  userName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "700",
  },

  userRole: {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#d1d5db",
    textTransform: "capitalize",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    color: "#d1d5db",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },

  navLinkActive: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    boxShadow: "0 8px 16px rgba(79,70,229,0.25)",
  },

  navIcon: {
    width: "22px",
    display: "inline-flex",
    justifyContent: "center",
  },

  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },

  backLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    color: "#d1d5db",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    color: "#ffffff",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    textAlign: "left",
  },

  mainContent: {
    marginLeft: "260px",
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    boxSizing: "border-box",
  },
};