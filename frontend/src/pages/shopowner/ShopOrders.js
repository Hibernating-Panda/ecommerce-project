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

  const acceptItem = async (id) => {
    try {
      await api.put(`/shopowner/order-items/${id}/accept`);
      showPopup("success", "Accepted", "Product accepted.");
      fetchOrders();
    } catch (error) {
      console.error("Accept error:", error);
      showPopup(
        "error",
        "Accept Failed",
        error.response?.data?.message || "Failed to accept product."
      );
    }
  };

  const readyOrder = async (orderId) => {
    try {
      await api.put(`/shopowner/orders/${orderId}/ready`);
      showPopup("success", "Ready", "Order marked ready.");
      fetchOrders();
    } catch (error) {
      console.error("Ready order error:", error);
      showPopup(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to mark order ready."
      );
    }
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

  const openMap = (order) => {
    const lat = order?.delivery_lat;
    const lng = order?.delivery_lng;

    if (!lat || !lng) {
      showPopup(
        "error",
        "No Map Location",
        "This order does not have a selected map location."
      );
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
      "_blank",
      "noopener,noreferrer"
    );
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
              <button type="button" style={styles.cancelBtn} onClick={closeRejectModal}>
                Cancel
              </button>

              <button type="button" style={styles.rejectBtn} onClick={submitReject}>
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
          Accept products first, then mark the whole order ready.
        </p>
      </div>

      {groupedOrders.length === 0 ? (
        <div style={styles.empty}>
          <h3>No active orders</h3>
          <p>Customer orders will appear here after checkout.</p>
        </div>
      ) : (
        <div style={styles.orderGrid}>
          {groupedOrders.map((group) => {
            const order = group.order;
            const rejectedTotal = getRejectedTotal(group.items);
            const orderTotal = getOrderTotal(group.items);
            const isDelivery = order?.order_type === "delivery";
            const hasMapLocation = Boolean(order?.delivery_lat && order?.delivery_lng);
            const canReady = canMarkOrderReady(group.items);
            const alreadyReady = isOrderAlreadyReady(group.items);

            return (
              <div key={order?.id || group.items[0]?.id} style={styles.orderCard}>
                <div style={styles.orderTop}>
                  <div>
                    <h2 style={styles.orderTitle}>Order #{order?.id || "N/A"}</h2>

                    <p style={styles.customerName}>
                      {order?.customer?.name || order?.customer_name || "Customer"}
                    </p>

                    <p style={styles.smallText}>
                      {order?.customer?.phone || "No phone"}
                    </p>
                  </div>

                  <div style={styles.orderTopRight}>
                    <strong style={styles.total}>${orderTotal.toFixed(2)}</strong>

                    {rejectedTotal > 0 && (
                      <p style={styles.rejectedTotal}>
                        Rejected not counted: ${rejectedTotal.toFixed(2)}
                      </p>
                    )}

                    <span style={getOrderStatusStyle(order?.status)}>
                      {getOrderStatusLabel(order)}
                    </span>

                    {canReady && !alreadyReady && (
                      <button
                        type="button"
                        style={styles.readyOrderBtn}
                        onClick={() => readyOrder(order.id)}
                      >
                        Ready Order
                      </button>
                    )}
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>Type</span>
                    <strong style={styles.infoValue}>
                      {order?.order_type ? formatStatus(order.order_type) : "Not selected"}
                    </strong>
                  </div>

                  <div style={styles.infoBox}>
                    <span style={styles.infoLabel}>
                      {order?.order_type === "pickup" ? "Pickup Date" : "Payment"}
                    </span>

                    <strong style={styles.infoValue}>
                      {order?.order_type === "pickup"
                        ? order?.pickup_date
                          ? new Date(order.pickup_date).toLocaleString()
                          : "Not selected"
                        : order?.payment_method
                        ? formatStatus(order.payment_method)
                        : "Not selected"}
                    </strong>
                  </div>
                </div>

                {order?.order_type === "pickup" ? (
                  <div style={styles.addressBox}>
                    <div>
                      <span style={styles.infoLabel}>Pickup Note</span>
                      <p style={styles.addressText}>Customer will pick up from the shop.</p>
                    </div>
                  </div>
                ) : (
                  <div style={styles.addressBox}>
                    <div style={styles.addressContent}>
                      <span style={styles.infoLabel}>Delivery Address</span>
                      <p style={styles.addressText}>
                        {order?.delivery_address || "No address"}
                      </p>

                      {hasMapLocation ? (
                        <p style={styles.coordinateText}>
                          {Number(order.delivery_lat).toFixed(6)},{" "}
                          {Number(order.delivery_lng).toFixed(6)}
                        </p>
                      ) : (
                        <p style={styles.noMapText}>No map location selected.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      style={{
                        ...styles.mapBtn,
                        opacity: isDelivery && hasMapLocation ? 1 : 0.55,
                        cursor: isDelivery && hasMapLocation ? "pointer" : "not-allowed",
                      }}
                      disabled={!isDelivery || !hasMapLocation}
                      onClick={() => openMap(order)}
                    >
                      Open Map
                    </button>
                  </div>
                )}

                <div style={styles.productList}>
                  {group.items.map((item) => {
                    const size = getOrderItemSize(item);

                    return (
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

                          {size && (
                            <div style={styles.sizeRow}>
                              <span style={styles.sizeLabel}>Size</span>
                              <span style={styles.sizeChip}>{size}</span>
                            </div>
                          )}

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
                            ) : item.status === "accepted" ? (
                              <span style={styles.acceptedText}>Accepted</span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  style={styles.acceptBtn}
                                  onClick={() => acceptItem(item.id)}
                                >
                                  Accept
                                </button>

                                <button
                                  type="button"
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const canMarkOrderReady = (items) => {
  const activeItems = (items || []).filter((item) => item.status !== "rejected");

  if (activeItems.length === 0) return false;

  return activeItems.every((item) =>
    ["accepted", "ready"].includes(item.status)
  );
};

const isOrderAlreadyReady = (items) => {
  const activeItems = (items || []).filter((item) => item.status !== "rejected");

  if (activeItems.length === 0) return false;

  return activeItems.every((item) => item.status === "ready");
};

const getOrderItemSize = (item) => {
  return (
    item?.product_size?.size ||
    item?.productSize?.size ||
    item?.size ||
    item?.selected_size ||
    ""
  );
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getItemLabel = (status) => {
  if (status === "rejected") return "Rejected";
  if (status === "ready") return "Ready";
  if (status === "accepted") return "Accepted";
  return "Pending";
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
  if (order.status === "accepted") return "Accepted";
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
    accepted: ["#dbeafe", "#1d4ed8"],
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
    maxWidth: "1180px",
    margin: "0 auto",
    boxSizing: "border-box",
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
  orderGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 18,
  },
  orderCard: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: "clamp(14px, 2vw, 20px)",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    boxSizing: "border-box",
  },
  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    paddingBottom: 14,
    borderBottom: "1px solid #e5e7eb",
  },
  orderTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 22,
  },
  customerName: {
    margin: "8px 0 0",
    color: "#111827",
    fontWeight: 900,
  },
  smallText: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 12,
  },
  orderTopRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  total: {
    color: "#166534",
    fontSize: 22,
  },
  rejectedTotal: {
    color: "#991b1b",
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
  },
  readyOrderBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  infoBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
  },
  infoLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  infoValue: {
    color: "#111827",
    overflowWrap: "anywhere",
  },
  addressBox: {
    marginTop: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  addressContent: {
    flex: 1,
    minWidth: 220,
  },
  addressText: {
    margin: 0,
    color: "#111827",
    fontWeight: 800,
    overflowWrap: "anywhere",
  },
  coordinateText: {
    margin: "6px 0 0",
    color: "#166534",
    fontSize: 12,
    fontWeight: 900,
  },
  noMapText: {
    margin: "6px 0 0",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 800,
  },
  mapBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  productList: {
    marginTop: 14,
    display: "grid",
    gap: 12,
  },
  productCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    background: "#ffffff",
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
    minWidth: 180,
  },
  productMeta: {
    color: "#6b7280",
    fontSize: 14,
  },
  sizeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  sizeLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  sizeChip: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: 999,
    padding: "3px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  productRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
    marginLeft: "auto",
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  acceptBtn: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    borderRadius: 10,
    padding: "8px 11px",
    fontWeight: 900,
    cursor: "pointer",
  },
  acceptedText: {
    color: "#1d4ed8",
    fontWeight: 900,
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
  empty: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
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
};

export default ShopOrders;