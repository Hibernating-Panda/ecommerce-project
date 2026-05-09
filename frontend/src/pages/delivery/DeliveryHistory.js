import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data.data || data);
      }
    } catch (error) {
      console.error("FETCH DELIVERY HISTORY ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.box}>Loading delivery history...</div>;
  }

  return (
    <div style={styles.box}>
      <h2 style={styles.heading}>Delivery History</h2>

      {orders.length === 0 ? (
        <p style={styles.empty}>No delivery history found.</p>
      ) : (
        <div style={styles.list}>
          {orders.map((order) => (
            <div key={order.id} style={styles.card}>
              <div>
                <h3 style={styles.orderTitle}>Order #{order.id}</h3>
                <p style={styles.text}>
                  Customer: {order.customer_name || order.user?.name || "Customer"}
                </p>
                <p style={styles.text}>Address: {order.address || "N/A"}</p>
              </div>

              <div style={{ textAlign: "right" }}>
                <strong style={styles.price}>
                  ${Number(order.total || 0).toFixed(2)}
                </strong>
                <p style={styles.date}>
                  {order.updated_at
                    ? new Date(order.updated_at).toLocaleString()
                    : "No date"}
                </p>
                <span style={styles.status}>{order.status || "delivered"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  box: {
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  heading: {
    margin: "0 0 18px",
    color: "#111827",
  },
  empty: {
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  orderTitle: {
    margin: "0 0 8px",
    color: "#111827",
  },
  text: {
    margin: "4px 0",
    color: "#6b7280",
    fontSize: 14,
  },
  price: {
    color: "#E8192C",
    fontSize: 18,
  },
  date: {
    color: "#6b7280",
    fontSize: 12,
  },
  status: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#15803d",
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
  },
};

export default DeliveryHistory;