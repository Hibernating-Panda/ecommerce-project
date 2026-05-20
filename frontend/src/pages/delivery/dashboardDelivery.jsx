import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

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

function DashboardDelivery() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assigned: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDeliveryStats();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchDeliveryStats = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/delivery/stats`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data.data || data);
      }
    } catch (error) {
      console.error("Fetch delivery stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <button
        type="button"
        style={styles.mobileMenuBtn}
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
            <div style={styles.logo}>🚚</div>

            <div>
              <h2 style={styles.logoTitle}>Delivery</h2>
              <p style={styles.logoSub}>Dashboard</p>
            </div>
          </div>

          <nav style={styles.nav}>
            <NavItem
              to="/delivery/dashboard"
              icon="📊"
              label="Overview"
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/orders"
              icon="📦"
              label="Assigned Orders"
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/history"
              icon="✅"
              label="Delivery History"
              onClick={() => setSidebarOpen(false)}
            />

            <NavItem
              to="/delivery/profile"
              icon="👤"
              label="Profile"
              onClick={() => setSidebarOpen(false)}
            />
          </nav>
        </div>

        <button type="button" style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>Delivery Man</p>
            <h1 style={styles.title}>Delivery Dashboard</h1>
            <p style={styles.subtitle}>
              Manage assigned deliveries and update delivery status.
            </p>
          </div>

          <div style={styles.statusBadge}>Online</div>
        </header>

        <section style={styles.statsGrid}>
          <StatCard title="Assigned" value={stats.assigned} icon="📦" />
          <StatCard title="Delivering" value={stats.delivering} icon="🛵" />
          <StatCard title="Delivered" value={stats.delivered} icon="✅" />
          <StatCard title="Cancelled" value={stats.cancelled} icon="❌" />
        </section>

        {loading ? (
          <div style={styles.loadingBox}>Loading dashboard...</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        ...styles.navLink,
        ...(isActive ? styles.activeNavLink : {}),
      })}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value}</h2>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
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
    background: COLORS.primary,
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
    marginBottom: 35,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: COLORS.primary,
    color: COLORS.dark,
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
  activeNavLink: {
    background: COLORS.primary,
    color: COLORS.dark,
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
    border: `1px solid ${COLORS.border}`,
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 6px",
    color: COLORS.primaryDark,
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
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
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
    border: `1px solid ${COLORS.border}`,
    minWidth: 0,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
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
    border: `1px solid ${COLORS.border}`,
    fontWeight: 800,
  },
};

export default DashboardDelivery;