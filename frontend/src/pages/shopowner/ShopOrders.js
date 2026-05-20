import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import { roleThemes } from "../../theme/roleThemes";

function ShopOrders() {
  const theme = roleThemes.shop_owner;

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectModal, setRejectModal] = useState({
    show: false,
    item: null,
    reason: "",
  });

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedOrders = useMemo(() => {
    const groups = {};

    orderItems.forEach((item) => {
      const orderId = item.order?.id || `unknown-${item.id}`;

      if (!groups[orderId]) {
        groups[orderId] = {
          order: item.order,
          items: [],
        };
      }

      groups[orderId].items.push(item);
    });

    return Object.values(groups);
  }, [orderItems]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shopowner/orders");

      setOrderItems(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Orders error:", error);
      showPopup(
        "error",
        "Load Failed",
        error.response?.data?.message || "Failed to load orders."
      );
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

  const openRejectModal = (item) => {
    setRejectModal({
      show: true,
      item,
      reason: "",
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      item: null,
      reason: "",
    });
  };

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) {
      showPopup("error", "Reason Required", "Please write a reject reason.");
      return;
    }

    try {
      await api.put(`/shopowner/order-items/${rejectModal.item.id}/reject`, {
        reject_reason: rejectModal.reason,
      });

      showPopup("success", "Rejected", "Product rejected.");
      closeRejectModal();
      fetchOrders();
    } catch (error) {
      console.error("Reject error:", error);
      showPopup(
        "error",
        "Reject Failed",
        error.response?.data?.message || "Failed to reject product."
      );
    }
  };

  const readyItem = async (id) => {
    try {
      await api.put(`/shopowner/order-items/${id}/ready`);
      showPopup("success", "Ready", "Product marked ready for pickup.");
      fetchOrders();
    } catch (error) {
      console.error("Ready error:", error);
      showPopup(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to mark product ready."
      );
    }
  };

  const getOrderTotal = (items) => {
    return items
      .filter((item) => item.status !== "rejected")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  };

  const getRejectedTotal = (items) => {
    return items
      .filter((item) => item.status === "rejected")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  };

  if (loading) {
    return <p style={styles.loading}>Loading orders...</p>;
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

      {rejectModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Reject Product</h2>
            <p style={styles.modalText}>
              Write the reason why this product is rejected.
            </p>

            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Example: Product out of stock..."
              style={styles.textarea}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeRejectModal}>
                Cancel
              </button>
              <button style={styles.rejectBtn} onClick={submitReject}>
                Reject Product
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>
        <h1 style={styles.title}>Orders</h1>
        <p style={styles.desc}>
          Products from the same customer order are grouped together.
        </p>
      </div>

      <div style={styles.tableBox}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Products</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Order Status</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Payment / Pickup</th>
              <th style={styles.th}>Address</th>
            </tr>
          </thead>

          <tbody>
            {groupedOrders.map((group) => {
              const rejectedTotal = getRejectedTotal(group.items);

              return (
                <tr key={group.order?.id || group.items[0]?.id}>
                  <td style={styles.td}>#{group.order?.id || "N/A"}</td>

                  <td style={styles.td}>
                    <strong>
                      {group.order?.customer?.name ||
                        group.order?.customer_name ||
                        "Customer"}
                    </strong>
                    <p style={styles.smallText}>
                      {group.order?.customer?.phone || "No phone"}
                    </p>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.productList}>
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            ...styles.productCard,
                            ...(item.status === "rejected"
                              ? styles.rejectedProductCard
                              : {}),
                          }}
                        >
                          <div style={styles.productInfo}>
                            <strong>{item.product?.name || "Product"}</strong>

                            <span style={styles.productMeta}>
                              Qty: {item.quantity} × $
                              {Number(item.price || 0).toFixed(2)}
                            </span>

                            {item.status === "rejected" && item.reject_reason && (
                              <span style={styles.reason}>
                                Reason: {item.reject_reason}
                              </span>
                            )}
                          </div>

                          <div style={styles.productRight}>
                            <span style={getItemStatusStyle(item.status)}>
                              {getItemLabel(item.status)}
                            </span>

                            <div style={styles.actionGroup}>
                              {item.status === "rejected" ? (
                                <span style={styles.rejectedText}>Rejected</span>
                              ) : item.status === "ready" ? (
                                <span style={styles.readyText}>Ready</span>
                              ) : (
                                <>
                                  {item.order?.order_type === "pickup" && (
                                    <button
                                      style={styles.readyBtn}
                                      onClick={() => readyItem(item.id)}
                                    >
                                      Ready
                                    </button>
                                  )}

                                  <button
                                    style={styles.rejectBtnSmall}
                                    onClick={() => openRejectModal(item)}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <strong>${getOrderTotal(group.items).toFixed(2)}</strong>

                    {rejectedTotal > 0 && (
                      <p style={styles.rejectedTotal}>
                        Rejected not counted: ${rejectedTotal.toFixed(2)}
                      </p>
                    )}
                  </td>

                  <td style={styles.td}>
                    <span style={getOrderStatusStyle(group.order?.status)}>
                      {getOrderStatusLabel(group.order)}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {group.order?.order_type
                        ? formatStatus(group.order.order_type)
                        : "Not selected"}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {group.order?.order_type === "pickup" ? (
                      <div>
                        <strong>Pickup Date</strong>
                        <p style={styles.smallText}>
                          {group.order?.pickup_date
                            ? new Date(group.order.pickup_date).toLocaleString()
                            : "Not selected"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <strong>Payment</strong>
                        <p style={styles.smallText}>
                          {group.order?.payment_method
                            ? formatStatus(group.order.payment_method)
                            : "Not selected"}
                        </p>
                      </div>
                    )}
                  </td>

                  <td style={styles.td}>
                    {group.order?.delivery_address || "No address"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {groupedOrders.length === 0 && (
          <div style={styles.empty}>
            <h3>No orders yet</h3>
            <p>Customer orders will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getItemLabel = (status) => {
  if (status === "rejected") return "Rejected";
  if (status === "ready") return "Ready";
  return "Ordered";
};

const getOrderStatusLabel = (order) => {
  if (!order?.status) return "Ordered";

  if (order.status === "ready_for_delivery" && order.order_type === "pickup") {
    return "Ready For Pickup";
  }

  if (order.status === "ready_for_delivery" && order.order_type === "delivery") {
    return "Ready For Delivery";
  }

  if (order.status === "in_transit") return "Delivering";
  if (order.status === "partially_rejected") return "Some Products Rejected";
  if (order.status === "pending") return "Ordered";

  return formatStatus(order.status);
};

const getItemStatusStyle = (status) => {
  const map = {
    rejected: ["#fee2e2", "#991b1b"],
    ready: ["#dcfce7", "#166534"],
    accepted: ["#dbeafe", "#1d4ed8"],
    pending: ["#fef9c3", "#854d0e"],
  };

  const [bg, color] = map[status] || ["#e5e7eb", "#374151"];

  return {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    backgroundColor: bg,
    color,
    whiteSpace: "nowrap",
  };
};

const getOrderStatusStyle = (status) => {
  const map = {
    ready_for_delivery: ["#dcfce7", "#166534"],
    in_transit: ["#dbeafe", "#1d4ed8"],
    delivered: ["#dcfce7", "#166534"],
    completed: ["#dcfce7", "#166534"],
    partially_rejected: ["#fee2e2", "#991b1b"],
    cancelled: ["#f3f4f6", "#374151"],
    pending: ["#fef9c3", "#854d0e"],
  };

  const [bg, color] = map[status] || ["#e5e7eb", "#374151"];

  return {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
    backgroundColor: bg,
    color,
    whiteSpace: "nowrap",
  };
};

const styles = {
  page: {
    width: "100%",
    maxWidth: "1440px",
  },
  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },
  header: {
    marginBottom: "24px",
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
  desc: {
    color: "#6b7280",
    marginTop: "8px",
  },
  tableBox: {
    backgroundColor: "white",
    borderRadius: "18px",
    overflowX: "auto",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1200,
  },
  th: {
    textAlign: "left",
    padding: "15px",
    backgroundColor: "#1e40af",
    color: "white",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    verticalAlign: "top",
  },
  productList: {
    display: "grid",
    gap: 12,
  },
  productCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    flexWrap: "wrap",
  },
  rejectedProductCard: {
    background: "#fff7f7",
    border: "1px solid #fecaca",
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  productMeta: {
    color: "#6b7280",
    fontSize: 14,
  },
  productRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  readyBtn: {
    background: "#dcfce7",
    color: "#166534",
    border: "none",
    borderRadius: 10,
    padding: "8px 11px",
    fontWeight: 900,
    cursor: "pointer",
  },
  readyText: {
    color: "#166534",
    fontWeight: 900,
  },
  rejectBtnSmall: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: 10,
    padding: "8px 11px",
    fontWeight: 900,
    cursor: "pointer",
  },
  rejectedText: {
    color: "#991b1b",
    fontWeight: 900,
  },
  reason: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: 700,
  },
  rejectedTotal: {
    color: "#991b1b",
    margin: "6px 0 0",
    fontSize: 12,
    fontWeight: 800,
  },
  empty: {
    padding: "40px",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modal: {
    background: "white",
    width: "min(480px, 92vw)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  modalTitle: {
    margin: 0,
    color: "#111827",
  },
  modalText: {
    color: "#6b7280",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 12,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  cancelBtn: {
    background: "#f3f4f6",
    color: "#111827",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  typeBadge: {
    display: "inline-block",
    background: "#f3f4f6",
    color: "#111827",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  smallText: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 12,
  },
};

export default ShopOrders;