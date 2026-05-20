import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { roleThemes } from "../../theme/roleThemes";

const AdminDeliveries = () => {
  const theme = roleThemes.admin;

  const [deliveries, setDeliveries] = useState([]);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({
    text: "",
    type: "success",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.deliveries)) return value.deliveries;
    if (Array.isArray(value?.delivery_men)) return value.delivery_men;
    if (Array.isArray(value?.data?.data)) return value.data.data;

    return [];
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });

    setTimeout(() => {
      setMessage({
        text: "",
        type: "success",
      });
    }, 3000);
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [deliveryRes, menRes] = await Promise.all([
        api.get("/admin/deliveries"),
        api.get("/admin/delivery-men"),
      ]);

      console.log("Admin deliveries response:", deliveryRes.data);
      console.log("Admin delivery men response:", menRes.data);

      setDeliveries(normalizeList(deliveryRes.data?.deliveries || deliveryRes.data));
      setDeliveryMen(normalizeList(menRes.data?.delivery_men || menRes.data));
    } catch (error) {
      console.error("Admin deliveries error:", error);

      showMessage(
        error.response?.data?.message || "Failed to load deliveries.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (deliveryId, driverId) => {
    if (!driverId) return;

    try {
      const res = await api.put(`/admin/deliveries/${deliveryId}/assign`, {
        driver_id: driverId,
      });

      showMessage(res.data.message || "Delivery man assigned.");
      fetchData();
    } catch (error) {
      console.error("Assign driver error:", error);

      showMessage(
        error.response?.data?.message || "Failed to assign driver.",
        "error"
      );
    }
  };

  const cancelDelivery = async (deliveryId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this delivery?"
    );

    if (!confirmCancel) return;

    try {
      const res = await api.put(`/admin/deliveries/${deliveryId}/cancel`);

      showMessage(res.data.message || "Delivery cancelled.");
      fetchData();
    } catch (error) {
      console.error("Cancel delivery error:", error);

      showMessage(
        error.response?.data?.message || "Failed to cancel delivery.",
        "error"
      );
    }
  };

  const getDeliveryItems = (delivery) => {
    return delivery.order_items || delivery.orderItems || [];
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {message.text && (
        <div
          style={{
            ...styles.message,
            ...(message.type === "error"
              ? styles.errorMessage
              : styles.successMessage),
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Admin</p>
          <h1 style={styles.title}>Deliveries</h1>
          <p style={styles.subtitle}>
            Assign delivery men and manage delivery tasks.
          </p>
        </div>

        <button
          style={{ ...styles.refreshBtn, backgroundColor: theme.primary }}
          onClick={fetchData}
        >
          Refresh
        </button>
      </div>

      <div style={styles.card}>
        {deliveries.length === 0 ? (
          <div style={styles.empty}>
            <h3>No delivery tasks yet</h3>
            <p>
              Delivery tasks will appear after a customer checks out with
              delivery.
            </p>
          </div>
        ) : (
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
                  <th style={styles.th}>Driver</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {deliveries.map((delivery) => {
                  const items = getDeliveryItems(delivery);

                  return (
                    <tr key={delivery.id}>
                      <td style={styles.td}>#{delivery.id}</td>
                      <td style={styles.td}>#{delivery.order_id}</td>

                      <td style={styles.td}>
                        <strong>{delivery.shop?.shop_name || "Shop"}</strong>
                        <p style={styles.smallText}>
                          {delivery.shop?.phone || "No phone"}
                        </p>
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
                        {items.length === 0 ? (
                          <span style={styles.noItems}>No items</span>
                        ) : (
                          <div style={styles.itemsList}>
                            {items.map((item) => (
                              <div key={item.id} style={styles.itemLine}>
                                <strong>
                                  {item.product?.name || "Product"}
                                </strong>
                                <span
                                  style={{
                                    ...styles.itemQty,
                                    color: theme.primary,
                                  }}
                                >
                                  × {item.quantity || 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td style={styles.td}>
                        {delivery.pickup_location || "No pickup address"}
                      </td>

                      <td style={styles.td}>
                        {delivery.delivery_location || "No delivery address"}
                      </td>

                      <td style={styles.td}>
                        <span style={statusStyle(delivery.status)}>
                          {formatStatus(delivery.status)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {delivery.driver ? (
                          <div>
                            <strong>{delivery.driver.name}</strong>
                            <p style={styles.smallText}>
                              {delivery.driver.phone || delivery.driver.email}
                            </p>
                          </div>
                        ) : (
                          <span style={styles.unassigned}>Unassigned</span>
                        )}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <select
                            style={styles.select}
                            value={delivery.driver_id || ""}
                            onChange={(e) =>
                              assignDriver(delivery.id, e.target.value)
                            }
                            disabled={
                              delivery.status === "delivered" ||
                              delivery.status === "cancelled"
                            }
                          >
                            <option value="">Assign driver</option>

                            {deliveryMen.map((man) => (
                              <option key={man.id} value={man.id}>
                                {man.name}
                                {man.phone ? ` (${man.phone})` : ""}
                              </option>
                            ))}
                          </select>

                          {delivery.status !== "cancelled" &&
                            delivery.status !== "delivered" && (
                              <button
                                style={styles.cancelBtn}
                                onClick={() => cancelDelivery(delivery.id)}
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const formatStatus = (status) => {
  return String(status || "pending")
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

  if (status === "delivered") {
    return {
      ...base,
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "assigned") {
    return {
      ...base,
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  if (status === "picked_up" || status === "in_transit") {
    return {
      ...base,
      background: "#ede9fe",
      color: "#6d28d9",
    };
  }

  if (status === "cancelled") {
    return {
      ...base,
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    ...base,
    background: "#fef9c3",
    color: "#854d0e",
  };
};

const styles = {
  page: {
    padding: "clamp(16px, 2.5vw, 28px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
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
    fontSize: "clamp(28px, 4vw, 38px)",
    color: "#111827",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
  },
  loadingText: {
    margin: 0,
    color: "#6b7280",
    fontWeight: 800,
  },
  message: {
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 800,
  },
  successMessage: {
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #bbf7d0",
  },
  errorMessage: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  refreshBtn: {
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1300,
  },
  th: {
    textAlign: "left",
    padding: 14,
    background: "#991b1b",
    color: "#fff",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  td: {
    padding: 14,
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
    color: "#374151",
    fontSize: 14,
  },
  smallText: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: 12,
  },
  itemsList: {
    display: "grid",
    gap: 5,
  },
  itemLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "6px 8px",
    borderRadius: 8,
    fontWeight: 700,
  },
  itemQty: {
    fontWeight: 900,
  },
  noItems: {
    color: "#9ca3af",
    fontWeight: 800,
  },
  unassigned: {
    color: "#b45309",
    fontWeight: 900,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 180,
  },
  select: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "9px",
    fontWeight: 700,
    background: "#fff",
  },
  cancelBtn: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: 10,
    padding: "9px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#6b7280",
  },
};

export default AdminDeliveries;