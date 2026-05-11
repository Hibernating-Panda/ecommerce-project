import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";

function ShopDashboard() {
  const [dashboard, setDashboard] = useState({
    total_products: 0,
    pending_orders: 0,
    completed_orders: 0,
    total_sales: 0,
    recent_orders: [],
    shop: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`/shopowner/dashboard?filter=${filter}`);
      setDashboard(res.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      showPopup("error", "Load Failed", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  const [filter, setFilter] = useState("day");

  if (loading) {
    return <p style={styles.loading}>Loading dashboard...</p>;
  }

  return (
    <div>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.desc}>
            Welcome back, {dashboard.shop?.owner_name || "Shop Owner"}.
          </p>
        </div>

        <div style={styles.badge}>
          {dashboard.shop?.shop_name || "My Shop"}
        </div>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Products</p>
          <h2 style={styles.cardValue}>{dashboard.total_products}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Orders</p>
          <h2 style={styles.cardValue}>{dashboard.pending_orders}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Completed Orders</p>
          <h2 style={styles.cardValue}>{dashboard.completed_orders}</h2>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Sales</p>
          <h2 style={styles.cardValue}>${dashboard.total_sales}</h2>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Orders</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {dashboard.recent_orders?.map((order) => (
              <tr key={order.id}>
                <td style={styles.td}>#{order.id}</td>
                <td style={styles.td}>{order.customer_name}</td>
                <td style={styles.td}>{order.product_name}</td>
                <td style={styles.td}>${order.total}</td>
                <td style={styles.td}>
                  <span style={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dashboard.recent_orders?.length === 0 && (
          <p style={styles.empty}>No recent orders.</p>
        )}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => ({
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "700",
  backgroundColor:
    status === "Completed"
      ? "#dcfce7"
      : status === "Pending"
      ? "#fef9c3"
      : status === "Cancelled"
      ? "#fee2e2"
      : "#dbeafe",
  color:
    status === "Completed"
      ? "#166534"
      : status === "Pending"
      ? "#854d0e"
      : status === "Cancelled"
      ? "#991b1b"
      : "#1d4ed8",
});

const styles = {
  loading: {
    fontSize: "18px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginTop: "8px",
  },
  badge: {
    backgroundColor: "#111827",
    color: "white",
    padding: "12px 18px",
    borderRadius: "999px",
    fontWeight: "800",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontWeight: "700",
  },
  cardValue: {
    margin: "12px 0 0",
    fontSize: "34px",
    color: "#111827",
  },
  section: {
    marginTop: "28px",
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    marginTop: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px",
    backgroundColor: "#f9fafb",
    color: "#374151",
  },
  td: {
    padding: "14px",
    borderTop: "1px solid #e5e7eb",
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    padding: "20px",
  },
  filterSelect: {
    padding: "12px 15px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    fontWeight: "700",
  },
};

export default ShopDashboard;