import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

function DashboardDelivery() {
  const [stats, setStats] = useState({
    assigned: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryStats();
  }, []);

  const fetchDeliveryStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data.data || data);
      }
    } catch (error) {
      console.error("FETCH DELIVERY STATS ERROR:", error);
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
      <aside style={styles.sidebar}>
        <div style={styles.logoBox}>
          <div style={styles.logo}>🚚</div>
          <div>
            <h2 style={styles.logoTitle}>Delivery</h2>
            <p style={styles.logoSub}>Dashboard</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link style={styles.navLink} to="/delivery">
            📊 Overview
          </Link>
          <Link style={styles.navLink} to="/delivery/orders">
            📦 Assigned Orders
          </Link>
          <Link style={styles.navLink} to="/delivery/history">
            ✅ Delivery History
          </Link>
          <Link style={styles.navLink} to="/delivery/profile">
            👤 Profile
          </Link>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Delivery Dashboard</h1>
            <p style={styles.subtitle}>
              Manage assigned deliveries and update order status.
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
    background: "#f5f6fa",
    display: "flex",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: 250,
    background: "#111827",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
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
    borderRadius: 12,
    background: "#E8192C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  logoTitle: {
    margin: 0,
    fontSize: 20,
  },
  logoSub: {
    margin: 0,
    fontSize: 12,
    color: "#9ca3af",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  navLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    fontSize: 14,
  },
  logoutBtn: {
    background: "#E8192C",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  main: {
    flex: 1,
    padding: 28,
  },
  header: {
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  title: {
    margin: 0,
    fontSize: 26,
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },
  statusBadge: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "8px 16px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 22,
  },
  statCard: {
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#fff0f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  statTitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: 13,
  },
  statValue: {
    margin: "4px 0 0",
    color: "#111827",
  },
  loadingBox: {
    background: "#fff",
    padding: 24,
    borderRadius: 14,
    textAlign: "center",
    color: "#6b7280",
  },
};

export default DashboardDelivery;