import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { roleThemes } from "../../theme/roleThemes";
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
  const theme = roleThemes.admin;

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
      {
        name: "Customers",
        value: stats.total_customers || stats.users?.customers || 0,
        color: roleThemes.user?.primary || "#16a34a",
      },
      {
        name: "Admins",
        value: stats.total_admins || stats.users?.admins || 0,
        color: roleThemes.admin?.primary || "#dc2626",
      },
      {
        name: "Delivery Men",
        value: stats.total_delivery_men || stats.users?.delivery_men || 0,
        color: roleThemes.delivery_man?.primary || "#facc15",
      },
      {
        name: "Shop Owners",
        value: stats.total_shop_owners || stats.users?.shop_owners || 0,
        color: roleThemes.shop_owner?.primary || "#2563eb",
      },
    ];
  }, [stats]);

  const overviewChartData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        name: "Users",
        value: stats.total_users || stats.users?.total || 0,
      },
      {
        name: "Products",
        value: stats.total_products || stats.products?.total || 0,
      },
      {
        name: "Admins",
        value: stats.total_admins || stats.users?.admins || 0,
      },
      {
        name: "Customers",
        value: stats.total_customers || stats.users?.customers || 0,
      },
      {
        name: "Delivery",
        value: stats.total_delivery_men || stats.users?.delivery_men || 0,
      },
      {
        name: "Shops",
        value: stats.total_shop_owners || stats.users?.shop_owners || 0,
      },
      {
        name: "Pending",
        value: stats.pending_accounts || stats.users?.pending || 0,
      },
      {
        name: "Active",
        value: stats.active_accounts || stats.users?.active || 0,
      },
      {
        name: "Rejected",
        value: stats.rejected_accounts || stats.users?.rejected || 0,
      },
    ];
  }, [stats]);

  const overviewColors = [
    "#6366f1",
    "#0ea5e9",
    roleThemes.admin?.primary || "#dc2626",
    roleThemes.user?.primary || "#16a34a",
    roleThemes.delivery_man?.primary || "#facc15",
    roleThemes.shop_owner?.primary || "#2563eb",
    "#f59e0b",
    "#10b981",
    "#ef4444",
  ];

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingCard}>
          <h2 style={styles.loadingTitle}>Loading dashboard...</h2>
          <p style={styles.loadingText}>
            Please wait while we fetch the latest admin statistics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.errorCard}>
          <h2 style={styles.loadingTitle}>Dashboard Error</h2>
          <p style={styles.loadingText}>{error}</p>

          <button
            type="button"
            onClick={fetchStats}
            style={{
              ...styles.retryButton,
              backgroundColor: theme.primary,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Admin</p>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Overview of users, products, and system activity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          style={{
            ...styles.refreshButton,
            backgroundColor: theme.primary,
          }}
        >
          Refresh Data
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.total_users || stats.users?.total}
          icon="👥"
          color="#6366f1"
        />

        <StatCard
          title="Customers"
          value={stats.total_customers || stats.users?.customers}
          icon="🛒"
          color={roleThemes.user?.primary || "#16a34a"}
        />

        <StatCard
          title="Shop Owners"
          value={stats.total_shop_owners || stats.users?.shop_owners}
          icon="🏪"
          color={roleThemes.shop_owner?.primary || "#2563eb"}
        />

        <StatCard
          title="Delivery Men"
          value={stats.total_delivery_men || stats.users?.delivery_men}
          icon="🚚"
          color={roleThemes.delivery_man?.primary || "#facc15"}
          darkText
        />

        <StatCard
          title="Admins"
          value={stats.total_admins || stats.users?.admins}
          icon="🛡️"
          color={roleThemes.admin?.primary || "#dc2626"}
        />

        <StatCard
          title="Products"
          value={stats.total_products || stats.products?.total}
          icon="📦"
          color="#0ea5e9"
        />

        <StatCard
          title="Pending Accounts"
          value={stats.pending_accounts || stats.users?.pending}
          icon="⏳"
          color="#f59e0b"
          darkText
        />

        <StatCard
          title="Active Accounts"
          value={stats.active_accounts || stats.users?.active}
          icon="✅"
          color="#10b981"
        />

        <StatCard
          title="Rejected Accounts"
          value={stats.rejected_accounts || stats.users?.rejected}
          icon="❌"
          color="#ef4444"
        />
      </div>

      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>System Overview</h3>

            <span
              style={{
                ...styles.chartBadge,
                backgroundColor: "#eef2ff",
                color: "#4338ca",
              }}
            >
              Bar Chart
            </span>
          </div>

          <div style={styles.chartBox}>
            {overviewChartData.length > 0 && (
              <ResponsiveContainer width="99%" height={320}>
                <BarChart data={overviewChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {overviewChartData.map((entry, index) => (
                      <Cell
                        key={`bar-${entry.name}`}
                        fill={overviewColors[index % overviewColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>User Role Distribution</h3>

            <span
              style={{
                ...styles.chartBadge,
                backgroundColor: theme.primaryLight,
                color: theme.primaryDark,
              }}
            >
              Role Theme Colors
            </span>
          </div>

          <div style={styles.chartBox}>
            {roleChartData.length > 0 && (
              <ResponsiveContainer width="99%" height={320}>
                <PieChart>
                  <Pie
                    data={roleChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {roleChartData.map((entry) => (
                      <Cell key={`role-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Quick Insights</h3>

          <ul style={styles.infoList}>
            <li>
              Total registered users:{" "}
              <strong>{stats.total_users || stats.users?.total || 0}</strong>
            </li>
            <li>
              Total customers:{" "}
              <strong>
                {stats.total_customers || stats.users?.customers || 0}
              </strong>
            </li>
            <li>
              Total shop owners:{" "}
              <strong>
                {stats.total_shop_owners || stats.users?.shop_owners || 0}
              </strong>
            </li>
            <li>
              Total delivery men:{" "}
              <strong>
                {stats.total_delivery_men || stats.users?.delivery_men || 0}
              </strong>
            </li>
            <li>
              Total products:{" "}
              <strong>
                {stats.total_products || stats.products?.total || 0}
              </strong>
            </li>
            <li>
              Pending accounts:{" "}
              <strong>
                {stats.pending_accounts || stats.users?.pending || 0}
              </strong>
            </li>
            <li>
              Active accounts:{" "}
              <strong>
                {stats.active_accounts || stats.users?.active || 0}
              </strong>
            </li>
            <li>
              Rejected accounts:{" "}
              <strong>
                {stats.rejected_accounts || stats.users?.rejected || 0}
              </strong>
            </li>
          </ul>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Admin Notes</h3>

          <div style={{ ...styles.noteBox, borderLeftColor: "#6366f1" }}>
            Monitor user growth regularly
          </div>

          <div style={{ ...styles.noteBox, borderLeftColor: "#0ea5e9" }}>
            Review newly added products
          </div>

          <div style={{ ...styles.noteBox, borderLeftColor: theme.primary }}>
            Manage categories and permissions
          </div>

          <div
            style={{
              ...styles.noteBox,
              borderLeftColor: roleThemes.shop_owner?.primary || "#2563eb",
            }}
          >
            Keep track of shop owner accounts
          </div>

          <div style={{ ...styles.noteBox, borderLeftColor: "#f59e0b" }}>
            Manage pending accounts
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, darkText = false }) {
  const softColor = `${color}18`;

  return (
    <div
      style={{
        ...styles.card,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: softColor,
      }}
    >
      <div style={styles.cardTop}>
        <span
          style={{
            ...styles.cardIcon,
            backgroundColor: softColor,
            color: darkText ? "#111827" : color,
          }}
        >
          {icon}
        </span>

        <span style={styles.cardTitle}>{title}</span>
      </div>

      <h2 style={{ ...styles.cardValue, color: darkText ? "#111827" : color }}>
        {value ?? 0}
      </h2>
    </div>
  );
}

const styles = {
  page: {
    padding: "clamp(16px, 2.5vw, 28px)",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },

  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  pageTitle: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 900,
    color: "#1f2937",
  },

  pageSubtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: 15,
  },

  refreshButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 10,
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 18,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    minWidth: 0,
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  cardIcon: {
    width: 38,
    height: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    fontSize: 20,
  },

  cardTitle: {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: 800,
  },

  cardValue: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 34px)",
    fontWeight: 900,
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
    gap: 20,
    marginBottom: 24,
  },

  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eef1f6",
    minWidth: 0,
    minHeight: 410,
  },

  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
    flexWrap: "wrap",
  },

  chartTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18,
    fontWeight: 900,
  },

  chartBadge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: 800,
  },

  chartBox: {
    width: "100%",
    height: 340,
    minHeight: 340,
    minWidth: 0,
    overflow: "hidden",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: 20,
  },

  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eef1f6",
  },

  infoTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 18,
    color: "#111827",
  },

  infoList: {
    margin: 0,
    paddingLeft: 18,
    color: "#374151",
    lineHeight: 1.9,
  },

  noteBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderLeftWidth: 5,
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
    color: "#374151",
    fontSize: 14,
    fontWeight: 700,
  },

  loadingWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingCard: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },

  errorCard: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
    textAlign: "center",
  },

  loadingTitle: {
    margin: "0 0 8px",
    color: "#111827",
  },

  loadingText: {
    margin: 0,
    color: "#6b7280",
  },

  retryButton: {
    marginTop: 14,
    padding: "10px 16px",
    border: "none",
    borderRadius: 10,
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 800,
  },
};

export default AdminDashboard;