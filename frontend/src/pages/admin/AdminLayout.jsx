import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roleThemes } from "../../theme/roleThemes";

export default function AdminLayout() {
  const theme = roleThemes.admin;
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊", end: true },
    { label: "Users", path: "/admin/users", icon: "👥" },
    { label: "Products", path: "/admin/products", icon: "📦" },
    { label: "Deliveries", path: "/admin/deliveries", icon: "🚚" },
    { label: "Categories", path: "/admin/categories", icon: "🏷️" },
  ];

  return (
    <div style={{ ...styles.wrapper, backgroundColor: theme.bg }}>
      <button
        type="button"
        style={{ ...styles.menuButton, backgroundColor: theme.primary }}
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {open && <div style={styles.overlay} onClick={() => setOpen(false)} />}

      <aside
        style={{
          ...styles.sidebar,
          transform: open ? "translateX(0)" : undefined,
          background: `linear-gradient(180deg, ${theme.primaryDark}, #111827)`,
        }}
      >
        <div>
          <div style={styles.brandBox}>
            <div style={{ ...styles.logo, backgroundColor: theme.primary }}>
              E
            </div>

            <div>
              <h2 style={styles.brandTitle}>E-Shop</h2>
              <p style={styles.brandSubtitle}>Admin Panel</p>
            </div>
          </div>

          <NavLink
            to="/admin/profile"
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              ...styles.userBox,
              ...(isActive
                ? {
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderColor: theme.border,
                  }
                : {}),
            })}
          >
            <div style={{ ...styles.avatar, backgroundColor: theme.primaryLight, color: theme.primaryDark }}>
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user.name} style={styles.avatarImage} />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                "A"
              )}
            </div>

            <div style={styles.userText}>
              <p style={styles.userName}>{user?.name || "Admin"}</p>
              <p style={styles.userRole}>{user?.role || "admin"}</p>
            </div>
          </NavLink>

          <nav style={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setOpen(false)}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive
                    ? {
                        backgroundColor: theme.primary,
                        color: "#ffffff",
                        boxShadow: "0 8px 16px rgba(220, 38, 38, 0.25)",
                      }
                    : {}),
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
    width: "100%",
  },
  menuButton: {
    display: "none",
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 1100,
    border: "none",
    color: "white",
    width: 44,
    height: 44,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    zIndex: 999,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    color: "#ffffff",
    padding: "22px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "4px 0 18px rgba(0,0,0,0.15)",
    zIndex: 1000,
    overflowY: "auto",
    transition: "transform 0.25s ease",
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 900,
    boxShadow: "0 8px 18px rgba(220,38,38,0.35)",
  },
  brandTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  brandSubtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#fecaca",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    textDecoration: "none",
    color: "#ffffff",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 900,
    overflow: "hidden",
    flexShrink: 0,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  userText: {
    minWidth: 0,
  },
  userName: {
    margin: 0,
    fontSize: 15,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#fca5a5",
    textTransform: "capitalize",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    color: "#fecaca",
    textDecoration: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
  },
  navIcon: {
    width: 22,
    display: "inline-flex",
    justifyContent: "center",
  },
  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.12)",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    color: "#ffffff",
    backgroundColor: "#ef4444",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
  },
  mainContent: {
    marginLeft: 260,
    minHeight: "100vh",
    boxSizing: "border-box",
  },
};

const responsiveStyle = document.createElement("style");
responsiveStyle.innerHTML = `
  @media (max-width: 900px) {
    button[style] {
      display: block !important;
    }

    aside[style] {
      transform: translateX(-100%);
    }

    main[style] {
      margin-left: 0 !important;
      padding-top: 58px !important;
    }
  }
`;
document.head.appendChild(responsiveStyle);