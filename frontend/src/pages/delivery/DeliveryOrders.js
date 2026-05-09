import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/orders`, {
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
      console.error("FETCH DELIVERY ORDERS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchAssignedOrders();
      }
    } catch (error) {
      console.error("UPDATE ORDER STATUS ERROR:", error);
    }
  };

  if (loading) {
    return <div style={styles.box}>Loading assigned orders...</div>;
  }

  return (
    <div style={styles.box}>
      <h2 style={styles.heading}>Assigned Orders</h2>

      {orders.length === 0 ? (
        <p style={styles.empty}>No assigned orders.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}>#{order.id}</td>
                  <td style={styles.td}>
                    {order.customer_name || order.user?.name || "Customer"}
                  </td>
                  <td style={styles.td}>
                    {order.phone || order.user?.phone || "N/A"}
                  </td>
                  <td style={styles.td}>{order.address || "N/A"}</td>
                  <td style={styles.td}>${Number(order.total || 0).toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={statusStyle(order.status)}>
                      {order.status || "assigned"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.pickBtn}
                        onClick={() => updateStatus(order.id, "delivering")}
                      >
                        Start
                      </button>

                      <button
                        style={styles.doneBtn}
                        onClick={() => updateStatus(order.id, "delivered")}
                      >
                        Done
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const statusStyle = (status) => {
  const base = {
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
  };

  if (status === "delivered") {
    return { ...base, background: "#dcfce7", color: "#15803d" };
  }

  if (status === "delivering") {
    return { ...base, background: "#dbeafe", color: "#1d4ed8" };
  }

  if (status === "cancelled") {
    return { ...base, background: "#fee2e2", color: "#b91c1c" };
  }

  return { ...base, background: "#fef3c7", color: "#b45309" };
};

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
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: 12,
    background: "#f9fafb",
    color: "#374151",
    fontSize: 13,
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #f1f1f1",
    fontSize: 14,
    color: "#374151",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  pickBtn: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "7px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  doneBtn: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "7px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default DeliveryOrders;