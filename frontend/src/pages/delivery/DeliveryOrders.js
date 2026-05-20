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
  bg: "#fffbeb",
  white: "#ffffff",
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
};

function DeliveryOrders() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAllDeliveries();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const getToken = () => localStorage.getItem("token");

  const fetchAllDeliveries = async () => {
    setLoading(true);

    try {
      const token = getToken();

      const [availableRes, assignedRes] = await Promise.all([
        fetch(`${API_BASE}/delivery/available`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
        fetch(`${API_BASE}/delivery/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ]);

      const availableData = await availableRes.json();
      const assignedData = await assignedRes.json();

      if (availableRes.ok) {
        setAvailableOrders(availableData.data || availableData);
      }

      if (assignedRes.ok) {
        setAssignedOrders(assignedData.data || assignedData);
      }
    } catch (error) {
      console.error("Fetch delivery orders error:", error);
      showMessage("Failed to load delivery tasks.");
    } finally {
      setLoading(false);
    }
  };

  const acceptTask = async (deliveryId) => {
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${deliveryId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to accept task.");
      }

      showMessage(data.message || "Task accepted.");
      fetchAllDeliveries();
    } catch (error) {
      console.error("Accept task error:", error);
      showMessage(error.message || "Failed to accept task.");
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${deliveryId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update delivery status.");
      }

      showMessage(data.message || "Status updated.");
      fetchAllDeliveries();
    } catch (error) {
      console.error("Update delivery status error:", error);
      showMessage(error.message || "Failed to update status.");
    }
  };

  if (loading) {
    return <div style={styles.box}>Loading delivery tasks...</div>;
  }

  return (
    <div style={styles.wrapper}>
      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.box}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.heading}>Available Delivery Tasks</h2>
            <p style={styles.subtext}>Accept a task to start delivering.</p>
          </div>

          <button style={styles.refreshBtn} onClick={fetchAllDeliveries}>
            Refresh
          </button>
        </div>

        {availableOrders.length === 0 ? (
          <p style={styles.empty}>No available delivery tasks.</p>
        ) : (
          <DeliveryTable
            deliveries={availableOrders}
            mode="available"
            onAccept={acceptTask}
            onUpdateStatus={updateStatus}
          />
        )}
      </section>

      <section style={styles.box}>
        <h2 style={styles.heading}>My Delivery Tasks</h2>

        {assignedOrders.length === 0 ? (
          <p style={styles.empty}>No assigned delivery tasks.</p>
        ) : (
          <DeliveryTable
            deliveries={assignedOrders}
            mode="assigned"
            onAccept={acceptTask}
            onUpdateStatus={updateStatus}
          />
        )}
      </section>
    </div>
  );
}

function DeliveryTable({ deliveries, mode, onAccept, onUpdateStatus }) {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Delivery ID</th>
            <th style={styles.th}>Order</th>
            <th style={styles.th}>Shop</th>
            <th style={styles.th}>Customer</th>
            <th style={styles.th}>Items</th>
            <th style={styles.th}>Pickup</th>
            <th style={styles.th}>Deliver To</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {deliveries.map((delivery) => {
            const items = delivery.order_items || delivery.orderItems || [];

            return (
              <tr key={delivery.id}>
                <td style={styles.td}>#{delivery.id}</td>
                <td style={styles.td}>#{delivery.order_id}</td>

                <td style={styles.td}>
                  <strong>{delivery.shop?.shop_name || "Shop"}</strong>
                  <p style={styles.smallText}>{delivery.shop?.phone || ""}</p>
                </td>

                <td style={styles.td}>
                  <strong>
                    {delivery.order?.customer?.name ||
                      delivery.order?.customer_name ||
                      "Customer"}
                  </strong>
                  <p style={styles.smallText}>
                    {delivery.order?.customer?.phone || "No phone"}
                  </p>
                </td>

                <td style={styles.td}>
                  <div style={styles.itemsList}>
                    {items.length === 0 ? (
                      <span style={styles.smallText}>No items</span>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} style={styles.itemLine}>
                          {item.product?.name || "Product"} ×{" "}
                          {item.quantity || 1}
                        </div>
                      ))
                    )}
                  </div>
                </td>

                <td style={styles.td}>{delivery.pickup_location}</td>
                <td style={styles.td}>{delivery.delivery_location}</td>

                <td style={styles.td}>
                  <span style={statusStyle(delivery.status)}>
                    {getStatusLabel(delivery.status)}
                  </span>
                </td>

                <td style={styles.td}>
                  {mode === "available" ? (
                    <button
                      type="button"
                      style={styles.acceptBtn}
                      onClick={() => onAccept(delivery.id)}
                    >
                      Accept Task
                    </button>
                  ) : (
                    <div style={styles.actions}>
                      {delivery.status === "assigned" && (
                        <button
                          type="button"
                          style={styles.pickBtn}
                          onClick={() =>
                            onUpdateStatus(delivery.id, "picked_up")
                          }
                        >
                          Picked Up
                        </button>
                      )}

                      {delivery.status === "picked_up" && (
                        <button
                          type="button"
                          style={styles.transitBtn}
                          onClick={() =>
                            onUpdateStatus(delivery.id, "in_transit")
                          }
                        >
                          In Transit
                        </button>
                      )}

                      {delivery.status !== "delivered" &&
                        delivery.status !== "cancelled" && (
                          <button
                            type="button"
                            style={styles.doneBtn}
                            onClick={() =>
                              onUpdateStatus(delivery.id, "delivered")
                            }
                          >
                            Delivered
                          </button>
                        )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const getStatusLabel = (status) => {
  if (status === "in_transit") return "Delivering";
  if (status === "picked_up") return "Picked Up";
  return formatStatus(status);
};

const formatStatus = (status) => {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusStyle = (status) => {
  const base = {
    padding: "6px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "capitalize",
    display: "inline-block",
    whiteSpace: "nowrap",
  };

  if (status === "delivered") {
    return { ...base, background: "#dcfce7", color: "#15803d" };
  }

  if (status === "in_transit") {
    return { ...base, background: "#dbeafe", color: "#1d4ed8" };
  }

  if (status === "picked_up") {
    return { ...base, background: "#ede9fe", color: "#6d28d9" };
  }

  if (status === "cancelled") {
    return { ...base, background: "#fee2e2", color: "#b91c1c" };
  }

  return { ...base, background: COLORS.primaryLight, color: COLORS.primaryDark };
};

const styles = {
  wrapper: {
    display: "grid",
    gap: 20,
  },
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  heading: {
    margin: "0 0 6px",
    color: COLORS.dark,
  },
  subtext: {
    margin: 0,
    color: COLORS.muted,
  },
  empty: {
    color: COLORS.muted,
    fontWeight: 700,
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
  tableWrapper: {
    overflowX: "auto",
    marginTop: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1100,
  },
  th: {
    textAlign: "left",
    padding: 12,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontSize: 13,
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: 12,
    borderBottom: `1px solid ${COLORS.softBorder}`,
    fontSize: 14,
    color: "#374151",
    verticalAlign: "top",
  },
  smallText: {
    margin: "4px 0 0",
    color: COLORS.muted,
    fontSize: 12,
  },
  itemsList: {
    display: "grid",
    gap: 5,
  },
  itemLine: {
    background: "#f9fafb",
    border: `1px solid ${COLORS.softBorder}`,
    padding: "6px 8px",
    borderRadius: 8,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  acceptBtn: {
    border: "none",
    background: COLORS.primary,
    color: COLORS.dark,
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
  },
  pickBtn: {
    border: "none",
    background: COLORS.blue,
    color: COLORS.white,
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  transitBtn: {
    border: "none",
    background: COLORS.primaryDark,
    color: COLORS.white,
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  doneBtn: {
    border: "none",
    background: COLORS.green,
    color: COLORS.white,
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
};

export default DeliveryOrders;