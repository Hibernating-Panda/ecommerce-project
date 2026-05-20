import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

const COLORS = {
  primary: "#facc15",
  primaryDark: "#854d0e",
  primaryLight: "#fef9c3",
  dark: "#111827",
  muted: "#6b7280",
  border: "#fde68a",
  softBorder: "#e5e7eb",
  white: "#ffffff",
  green: "#16a34a",
  red: "#dc2626",
};

function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/delivery/history`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load delivery history.");
      }

      setOrders(data.data || data);
    } catch (error) {
      console.error("Fetch delivery history error:", error);
      showMessage(error.message || "Failed to load delivery history.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.box}>Loading delivery history...</div>;
  }

  return (
    <div style={styles.box}>
      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Delivery History</h2>
          <p style={styles.subtext}>
            View completed and past delivery tasks.
          </p>
        </div>

        <button type="button" style={styles.refreshBtn} onClick={fetchHistory}>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyBox}>
          <h3 style={styles.emptyTitle}>No delivery history found</h3>
          <p style={styles.emptyText}>
            Completed delivery tasks will appear here.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order.id} style={styles.card}>
              <div style={styles.left}>
                <h3 style={styles.orderTitle}>
                  Order #{order.order_id || order.id}
                </h3>

                <p style={styles.text}>
                  Customer:{" "}
                  <strong>
                    {order.order?.customer?.name ||
                      order.customer_name ||
                      order.user?.name ||
                      "Customer"}
                  </strong>
                </p>

                <p style={styles.text}>
                  Pickup: {order.pickup_location || order.pickup_address || "N/A"}
                </p>

                <p style={styles.text}>
                  Deliver To:{" "}
                  {order.delivery_location ||
                    order.delivery_address ||
                    order.address ||
                    "N/A"}
                </p>
              </div>

              <div style={styles.right}>
                <strong style={styles.price}>
                  ${Number(order.order?.total || order.total || 0).toFixed(2)}
                </strong>

                <p style={styles.date}>
                  {order.completed_at
                    ? new Date(order.completed_at).toLocaleString()
                    : order.updated_at
                    ? new Date(order.updated_at).toLocaleString()
                    : "No date"}
                </p>

                <span style={statusStyle(order.status || "delivered")}>
                  {formatStatus(order.status || "delivered")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const formatStatus = (status) => {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  };

  if (status === "delivered" || status === "completed") {
    return {
      ...base,
      background: "#dcfce7",
      color: "#15803d",
    };
  }

  if (status === "cancelled") {
    return {
      ...base,
      background: "#fee2e2",
      color: "#b91c1c",
    };
  }

  return {
    ...base,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
  };
};

const styles = {
  box: {
    background: COLORS.white,
    borderRadius: 18,
    padding: "clamp(16px, 2.5vw, 22px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    border: `1px solid ${COLORS.border}`,
  },
  message: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    marginBottom: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  heading: {
    margin: "0 0 6px",
    color: COLORS.dark,
  },
  subtext: {
    margin: 0,
    color: COLORS.muted,
  },
  refreshBtn: {
    border: "none",
    background: COLORS.primary,
    color: COLORS.dark,
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  emptyBox: {
    background: "#f9fafb",
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 14,
    padding: 24,
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    color: COLORS.dark,
  },
  emptyText: {
    color: COLORS.muted,
    margin: "8px 0 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 16,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    background: COLORS.white,
  },
  left: {
    flex: 1,
    minWidth: 240,
  },
  right: {
    textAlign: "right",
    minWidth: 180,
  },
  orderTitle: {
    margin: "0 0 8px",
    color: COLORS.dark,
  },
  text: {
    margin: "4px 0",
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 1.5,
  },
  price: {
    color: COLORS.primaryDark,
    fontSize: 20,
  },
  date: {
    color: COLORS.muted,
    fontSize: 12,
    margin: "6px 0",
  },
};

export default DeliveryHistory;