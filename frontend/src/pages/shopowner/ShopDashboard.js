import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import { roleThemes } from "../../theme/roleThemes";

function ShopDashboard() {
  const theme = roleThemes.shop_owner;

  const [filter, setFilter] = useState("day");
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    total_products: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_sales: 0,
    recent_orders: [],
    shop: null,
  });

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shopowner/dashboard?filter=${filter}`);
      setDashboard(res.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      showPopup("error", "Load Failed", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

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

  const recentOrders = dashboard.recent_orders || [];

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <div style={{ ...styles.loader, borderTopColor: theme.primary }} />
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
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
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.desc}>
            Welcome back, {dashboard.shop?.owner_name || "Shop Owner"}.
          </p>
        </div>

        <div style={{ ...styles.badge, backgroundColor: theme.primary }}>
          {dashboard.shop?.shop_name || "My Shop"}
        </div>
      </div>

      <div style={styles.toolbar}>
        <label style={styles.filterLabel}>
          View by
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              ...styles.filterSelect,
              borderColor: theme.border,
              color: theme.primaryDark,
            }}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </label>
      </div>

      <div style={styles.cards}>
        <StatCard
          title="Total Products"
          value={dashboard.total_products}
          theme={theme}
        />

        <StatCard
          title="Pending Orders"
          value={dashboard.pending_orders}
          theme={theme}
        />

        <StatCard
          title="Completed Orders"
          value={dashboard.completed_orders}
          theme={theme}
        />

        <StatCard
          title="Total Sales"
          value={`$${Number(dashboard.total_sales || 0).toFixed(2)}`}
          theme={theme}
        />
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Recent Orders</h2>
            <p style={styles.sectionDesc}>Latest product orders from your shop.</p>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>#{item.order_id || item.order?.id}</td>
                  <td style={styles.td}>
                    {item.order?.customer?.name || item.order?.customer_name || "Customer"}
                  </td>
                  <td style={styles.td}>{item.product?.name || "Product"}</td>
                  <td style={styles.td}>${Number(item.total || 0).toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(item.status)}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentOrders.length === 0 && (
          <p style={styles.empty}>No recent orders.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, theme }) {
  return (
    <div style={{ ...styles.card, borderColor: theme.border }}>
      <p style={styles.cardLabel}>{title}</p>
      <h2 style={{ ...styles.cardValue, color: theme.primaryDark }}>
        {value}
      </h2>
    </div>
  );
}

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusStyle = (status) => {
  const map = {
    ready: {
      bg: "#dcfce7",
      color: "#166534",
    },
    accepted: {
      bg: "#dbeafe",
      color: "#1d4ed8",
    },
    pending: {
      bg: "#fef9c3",
      color: "#854d0e",
    },
    rejected: {
      bg: "#fee2e2",
      color: "#991b1b",
    },
  };

  const selected = map[status] || {
    bg: "#e5e7eb",
    color: "#374151",
  };

  return {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    backgroundColor: selected.bg,
    color: selected.color,
    whiteSpace: "nowrap",
  };
};

const styles = {
  page: {
    width: "100%",
    maxWidth: "1440px",
    margin: "0 auto",
  },
  loadingBox: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
  },
  loader: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "4px solid #e5e7eb",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#374151",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
    flexWrap: "wrap",
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
    fontSize: "clamp(28px, 4vw, 40px)",
    color: "#111827",
    lineHeight: 1.1,
  },
  desc: {
    color: "#6b7280",
    marginTop: "8px",
    fontSize: "clamp(14px, 2vw, 16px)",
  },
  badge: {
    color: "white",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: "900",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "18px",
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#374151",
    fontWeight: "800",
    flexWrap: "wrap",
  },
  filterSelect: {
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontWeight: "800",
    outline: "none",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "clamp(14px, 2vw, 20px)",
  },
  card: {
    backgroundColor: "white",
    padding: "clamp(18px, 2.5vw, 24px)",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
    minWidth: 0,
  },
  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontWeight: "800",
  },
  cardValue: {
    margin: "12px 0 0",
    fontSize: "clamp(28px, 4vw, 36px)",
  },
  section: {
    marginTop: "28px",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "clamp(16px, 2.5vw, 24px)",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    color: "#111827",
  },
  sectionDesc: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    marginTop: "18px",
  },
  table: {
    width: "100%",
    minWidth: "720px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "14px",
    borderTop: "1px solid #e5e7eb",
    color: "#374151",
    fontWeight: "600",
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
    fontWeight: "700",
  },
};

export default ShopDashboard;