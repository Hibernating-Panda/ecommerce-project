import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const roleChartData = useMemo(() => {
    if (!stats) return [];

    return [
      { name: "Customers", value: stats.total_customers || 0 },
      { name: "Admins", value: stats.total_admins || 0 },
      { name: "Delivery Men", value: stats.total_delivery_men || 0 },
      { name: "Shop Owners", value: stats.total_shop_owners || 0 },
    ];
  }, [stats]);

  const overviewChartData = useMemo(() => {
    if (!stats) return [];

    return [
      { name: "Users", value: stats.total_users || 0 },
      { name: "Products", value: stats.total_products || 0 },
      { name: "Admins", value: stats.total_admins || 0 },
      { name: "Customers", value: stats.total_customers || 0 },
      { name: "Delivery", value: stats.total_delivery_men || 0 },
      { name: "Shops", value: stats.total_shop_owners || 0 },
      { name: "Pending", value: stats.pending_accounts || 0 },
      { name: "Active", value: stats.active_accounts || 0 },
      { name: "Rejected", value: stats.rejected_accounts || 0 },
    ];
  }, [stats]);

  const BAR_COLORS = [
    "#000000", // Users
    "#9333ea", // Products
    "#2563eb", // Admins
    "#22c55e", // Customers
    "#ef4444", // Delivery
    "#f59e0b", // Shops
    "#f97316", // Pending
    "#16a34a", // Active
    "#dc2626", // Rejected
  ];

  const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444"];

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingCard}>
          <h2>Loading dashboard...</h2>
          <p>Please wait while we fetch the latest admin statistics.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.errorCard}>
          <h2>Dashboard Error</h2>
          <p>{error}</p>
          <button onClick={fetchStats} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Overview of users, products, and system activity.
          </p>
        </div>

        <button onClick={fetchStats} style={styles.refreshButton}>
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Users" value={stats.total_users} icon="👥" />
        <StatCard title="Customers" value={stats.total_customers} icon="🛒" />
        <StatCard title="Shop Owners" value={stats.total_shop_owners} icon="🏪" />
        <StatCard title="Delivery Men" value={stats.total_delivery_men} icon="🚚" />
        <StatCard title="Admins" value={stats.total_admins} icon="🛡️" />
        <StatCard title="Products" value={stats.total_products} icon="📦" />
        <StatCard title="Pending Accounts" value={stats.pending_accounts} icon="⏳" />
        <StatCard title="Active Accounts" value={stats.active_accounts} icon="✅" />
        <StatCard title="Rejected Accounts" value={stats.rejected_accounts} icon="❌" />
      </div>

      {/* Charts */}
      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>System Overview</h3>
            <span style={styles.chartBadge}>Bar Chart</span>
          </div>

          <div style={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {overviewChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>User Role Distribution</h3>
            <span style={styles.chartBadge}>Pie Chart</span>
          </div>

          <div style={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomGrid}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Quick Insights</h3>
          <ul style={styles.infoList}>
            <li>Total registered users: <strong>{stats.total_users}</strong></li>
            <li>Total customers: <strong>{stats.total_customers}</strong></li>
            <li>Total shop owners: <strong>{stats.total_shop_owners}</strong></li>
            <li>Total delivery men: <strong>{stats.total_delivery_men}</strong></li>
            <li>Total products in system: <strong>{stats.total_products}</strong></li>
            <li>Pending accounts: <strong>{stats.pending_accounts}</strong></li>
            <li>Active accounts: <strong>{stats.active_accounts}</strong></li>
            <li>Rejected accounts: <strong>{stats.rejected_accounts}</strong></li>
          </ul>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Admin Notes</h3>
          <div style={styles.noteBox}> Monitor user growth regularly</div>
          <div style={styles.noteBox}> Review newly added products</div>
          <div style={styles.noteBox}> Manage categories and permissions</div>
          <div style={styles.noteBox}> Keep track of shop owner accounts</div>
          <div style={styles.noteBox}> Manage pending accounts</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.cardIcon}>{icon}</span>
        <span style={styles.cardTitle}>{title}</span>
      </div>
      <h2 style={styles.cardValue}>{value ?? 0}</h2>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#1f2937",
  },
  pageSubtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },
  refreshButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  cardIcon: {
    fontSize: "22px",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#6b7280",
    fontWeight: "600",
  },
  cardValue: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "10px",
    flexWrap: "wrap",
  },
  chartTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
    fontWeight: "700",
  },
  chartBadge: {
    fontSize: "12px",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  chartBox: {
    width: "100%",
    height: "320px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
  },
  infoTitle: {
    marginTop: 0,
    marginBottom: "16px",
    fontSize: "18px",
    color: "#111827",
  },
  infoList: {
    margin: 0,
    paddingLeft: "18px",
    color: "#374151",
    lineHeight: "1.9",
  },
  noteBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "10px",
    color: "#374151",
    fontSize: "14px",
  },
  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    padding: "20px",
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  retryButton: {
    marginTop: "14px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AdminDashboard;