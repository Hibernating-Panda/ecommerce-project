import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { roleThemes } from "../../theme/roleThemes";

function DashboardDelivery() {
  const theme = roleThemes.delivery_man;
  const navigate = useNavigate();
  const { user, logout, updateAuthUser } = useAuth();

  const [stats, setStats] = useState({
    available: 0,
    going_to_shop: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layoutUser, setLayoutUser] = useState(user);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchDeliveryStats();
    fetchFreshProfile();
  }, []);

  useEffect(() => {
    setLayoutUser(user);
  }, [user]);

  const fetchDeliveryStats = async () => {
    try {
      setLoading(true);

      const res = await api.get("/delivery/stats");
      setStats(res.data.data || res.data);
    } catch (error) {
      console.error("Fetch delivery stats error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreshProfile = async () => {
    try {
      const res = await api.get("/profile");
      const freshUser = res.data.user || res.data;

      setLayoutUser(freshUser);
      setImageError(false);
      localStorage.setItem("user", JSON.stringify(freshUser));

      if (typeof updateAuthUser === "function") {
        updateAuthUser(freshUser);
      }
    } catch (error) {
      console.error("Delivery profile refresh error:", error.response?.data || error);
    }
  };

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
    return normalizeImageUrl(
      layoutUser?.profile_image_url || layoutUser?.profile_image || ""
    );
  }, [layoutUser]);

  const activeTrips = Number(stats.going_to_shop || 0) + Number(stats.in_transit || 0);

  return (
    <div style={{ ...styles.page, background: theme.bg || COLORS.bg }}>
      <button
        type="button"
        style={{ ...styles.mobileMenuBtn, background: theme.primary }}
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        style={{
          ...styles.sidebar,
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
      >
        <div>
          <div style={styles.logoBox}>
            <div
              style={{
                ...styles.logo,
                background: theme.primary,
                color: theme.primaryDark,
              }}
            >
              🛵
            </div>

            <div>
              <h2 style={styles.logoTitle}>Courier Hub</h2>
              <p style={styles.logoSub}>Delivery workspace</p>
            </div>
          </div>

          <NavLink
            to="/delivery/profile"
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              ...styles.userBox,
              ...(isActive
                ? {
                    backgroundColor: "rgba(255,255,255,0.16)",
                    borderColor: theme.border,
                  }
                : {}),
            })}
          >
            <div
              style={{
                ...styles.avatar,
                backgroundColor: theme.primaryLight,
                color: theme.primaryDark,
              }}
            >
              {profileImageSrc && !imageError ? (
                <img
                  src={profileImageSrc}
                  alt={layoutUser?.name || "Delivery Man"}
                  style={styles.avatarImage}
                  onError={() => setImageError(true)}
                />
              ) : layoutUser?.name ? (
                layoutUser.name.charAt(0).toUpperCase()
              ) : (
                "D"
              )}
            </div>

            <div style={styles.userText}>
              <p style={styles.userName}>{layoutUser?.name || "Delivery Man"}</p>
              <p style={styles.userRole}>Delivery Partner</p>
            </div>
          </NavLink>

          <nav style={styles.nav}>
            <NavItem
              to="/delivery/dashboard"
              icon="📍"
              label="Route Overview"
              theme={theme}
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/orders"
              icon="🛵"
              label="Delivery Jobs"
              theme={theme}
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/history"
              icon="🧾"
              label="Trip History"
              theme={theme}
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/profile"
              icon="👤"
              label="Courier Profile"
              theme={theme}
              onClick={() => setSidebarOpen(false)}
            />
          </nav>
        </div>

        <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header
          style={{
            ...styles.header,
            borderColor: theme.border,
          }}
        >
          <div>
            <p style={{ ...styles.kicker, color: theme.primaryDark }}>
              Delivery Partner
            </p>
            <h1 style={styles.title}>Route Overview</h1>
            <p style={styles.subtitle}>
              Pick up jobs, follow your route, and complete deliveries.
            </p>
          </div>

          <div
            style={{
              ...styles.statusBadge,
              background: theme.primaryLight,
              color: theme.primaryDark,
            }}
          >
            Online
          </div>
        </header>

        <section style={styles.statsGrid}>
          <StatCard
            title="Open Jobs"
            value={stats.available}
            icon="📦"
            theme={theme}
          />

          <StatCard
            title="Active Trips"
            value={activeTrips}
            icon="🛵"
            theme={theme}
          />

          <StatCard
            title="To Shop"
            value={stats.going_to_shop}
            icon="🏪"
            theme={theme}
          />

          <StatCard
            title="Delivering"
            value={stats.in_transit}
            icon="📍"
            theme={theme}
          />

          <StatCard
            title="Completed"
            value={stats.delivered}
            icon="✅"
            theme={theme}
          />
        </section>

        {loading ? (
          <div
            style={{
              ...styles.loadingBox,
              borderColor: theme.border,
            }}
          >
            Loading route dashboard...
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, theme, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        ...styles.navLink,
        ...(isActive
          ? {
              background: theme.primary,
              color: theme.primaryDark,
            }
          : {}),
      })}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function StatCard({ title, value, icon, theme }) {
  return (
    <div
      style={{
        ...styles.statCard,
        borderColor: theme.border,
      }}
    >
      <div
        style={{
          ...styles.statIcon,
          background: theme.primaryLight,
          color: theme.primaryDark,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value ?? 0}</h2>
      </div>
    </div>
  );
}

const COLORS = {
  primary: "#facc15",
  primaryDark: "#854d0e",
  primaryLight: "#fef9c3",
  dark: "#111827",
  muted: "#6b7280",
  border: "#fde68a",
  bg: "#fffbeb",
  white: "#ffffff",
  red: "#dc2626",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "Arial, sans-serif",
  },

  mobileMenuBtn: {
    display: "none",
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 1100,
    width: 44,
    height: 44,
    borderRadius: 12,
    border: "none",
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    zIndex: 998,
  },

  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #111827, #1f2937)",
    color: COLORS.white,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    transition: "transform 0.25s ease",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 900,
  },

  logoTitle: {
    margin: 0,
    fontSize: 21,
  },

  logoSub: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#d1d5db",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    textDecoration: "none",
    color: "#ffffff",
  },

  avatar: {
    width: 46,
    height: 46,
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
    display: "block",
  },

  userText: {
    minWidth: 0,
  },

  userName: {
    color: "#ffffff",
    margin: 0,
    fontSize: 14,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  userRole: {
    color: "#d1d5db",
    margin: "4px 0 0",
    fontSize: 12,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  navLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    fontSize: 14,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  logoutBtn: {
    background: COLORS.red,
    color: COLORS.white,
    border: "none",
    padding: "12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },

  main: {
    flex: 1,
    marginLeft: 260,
    padding: "clamp(18px, 3vw, 28px)",
    boxSizing: "border-box",
    minWidth: 0,
  },

  header: {
    background: COLORS.white,
    borderRadius: 18,
    padding: "clamp(18px, 3vw, 24px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    borderWidth: 1,
    borderStyle: "solid",
    flexWrap: "wrap",
  },

  kicker: {
    margin: "0 0 6px",
    fontWeight: 900,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: 0,
    fontSize: "clamp(26px, 4vw, 36px)",
    color: COLORS.dark,
  },

  subtitle: {
    margin: "6px 0 0",
    color: COLORS.muted,
    fontSize: 14,
  },

  statusBadge: {
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
    gap: 16,
    marginBottom: 22,
  },

  statCard: {
    background: COLORS.white,
    borderRadius: 18,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    borderWidth: 1,
    borderStyle: "solid",
    minWidth: 0,
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    flexShrink: 0,
  },

  statTitle: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 800,
  },

  statValue: {
    margin: "4px 0 0",
    color: COLORS.dark,
  },

  loadingBox: {
    background: COLORS.white,
    padding: 24,
    borderRadius: 18,
    textAlign: "center",
    color: COLORS.muted,
    borderWidth: 1,
    borderStyle: "solid",
    fontWeight: 800,
  },
};

export default DashboardDelivery;