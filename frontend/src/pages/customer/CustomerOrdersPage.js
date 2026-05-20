import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API_URL, authHeaders } from "../../services/api";

const COLORS = {
  primary: "#16a34a",
  primaryDark: "#166534",
  primaryLight: "#dcfce7",
  dark: "#111827",
  muted: "#6b7280",
  border: "#bbf7d0",
  softBorder: "#e5e7eb",
  bg: "#f0fdf4",
  white: "#ffffff",
  red: "#dc2626",
};

const CustomerOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [checkoutForms, setCheckoutForms] = useState({});
  const [abaModal, setAbaModal] = useState({
    show: false,
    order: null,
    form: null,
  });
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2800);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/customer/orders`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders || data.data || []);
    } catch (error) {
      showMessage(error.message || "Failed to load orders.");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel order.");
      }

      showMessage(data.message || "Order cancelled.");
      fetchOrders();
    } catch (error) {
      showMessage(error.message || "Failed to cancel order.");
    }
  };

  const updateCheckoutForm = (orderId, field, value) => {
    setCheckoutForms((prev) => ({
      ...prev,
      [orderId]: {
        order_type: "delivery",
        payment_method: "cash",
        pickup_date: "",
        ...(prev[orderId] || {}),
        [field]: value,
      },
    }));
  };

  const getCheckoutForm = (orderId) => {
    return (
      checkoutForms[orderId] || {
        order_type: "delivery",
        payment_method: "cash",
        pickup_date: "",
      }
    );
  };

  const checkoutOrder = async (order) => {
    const form = getCheckoutForm(order.id);

    if (form.order_type === "pickup" && !form.pickup_date) {
      showMessage("Please select a pickup date.");
      return;
    }

    if (form.order_type === "delivery" && !form.payment_method) {
      showMessage("Please select a payment method.");
      return;
    }

    if (form.order_type === "delivery" && form.payment_method === "online") {
      setAbaModal({
        show: true,
        order,
        form,
      });
      return;
    }

    await submitCheckout(order.id, form);
  };

  const submitCheckout = async (orderId, form) => {
    setCheckingOut(true);

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/checkout`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          order_type: form.order_type,
          payment_method:
            form.order_type === "delivery" ? form.payment_method : null,
          pickup_date: form.order_type === "pickup" ? form.pickup_date : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to checkout order.");
      }

      setAbaModal({
        show: false,
        order: null,
        form: null,
      });

      showMessage(data.message || "Order checkout completed.");
      fetchOrders();
    } catch (error) {
      showMessage(error.message || "Failed to checkout order.");
    } finally {
      setCheckingOut(false);
    }
  };

  const canCheckout = (order) => {
    const activeItems = (order.items || []).filter(
      (item) => item.status !== "rejected"
    );

    if (activeItems.length === 0) return false;

    return ![
      "cancelled",
      "ready_for_delivery",
      "in_transit",
      "delivered",
      "completed",
    ].includes(order.status);
  };

  const canCancel = (order) => {
    return !["cancelled", "in_transit", "delivered", "completed"].includes(
      order.status
    );
  };

  const getCheckoutTotal = (order) => {
    return (order.items || [])
      .filter((item) => item.status !== "rejected")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  };

  const getRejectedTotal = (order) => {
    return (order.items || [])
      .filter((item) => item.status === "rejected")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  };

  const hasRejectedItems = (order) => {
    return (order.items || []).some((item) => item.status === "rejected");
  };

  const getShopPaymentGroups = (order) => {
    const groups = {};

    (order.items || [])
      .filter((item) => item.status !== "rejected")
      .forEach((item) => {
        const shopId = item.shop?.id || item.shop_id || "unknown";

        if (!groups[shopId]) {
          groups[shopId] = {
            shop: item.shop || null,
            items: [],
            total: 0,
          };
        }

        groups[shopId].items.push(item);
        groups[shopId].total += Number(item.total || 0);
      });

    return Object.values(groups);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      {abaModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.paymentModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Pay Products with ABA</h2>
                <p style={styles.modalSubtitle}>
                  Scan each shop QR to pay for products. Delivery fee is paid
                  separately to the delivery person.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() =>
                  setAbaModal({
                    show: false,
                    order: null,
                    form: null,
                  })
                }
              >
                ×
              </button>
            </div>

            <div style={styles.qrList}>
              {getShopPaymentGroups(abaModal.order).map((group, index) => (
                <div key={group.shop?.id || index} style={styles.qrCard}>
                  <div style={styles.qrInfo}>
                    <h3 style={styles.qrShopName}>
                      {group.shop?.shop_name || "Shop"}
                    </h3>

                    <p style={styles.qrText}>
                      Product Amount:{" "}
                      <strong>${group.total.toFixed(2)}</strong>
                    </p>

                    {group.shop?.aba_account_name && (
                      <p style={styles.qrText}>
                        Account Name:{" "}
                        <strong>{group.shop.aba_account_name}</strong>
                      </p>
                    )}

                    {group.shop?.aba_account_number && (
                      <p style={styles.qrText}>
                        Account Number:{" "}
                        <strong>{group.shop.aba_account_number}</strong>
                      </p>
                    )}

                    <div style={styles.qrItems}>
                      {group.items.map((item) => (
                        <span key={item.id} style={styles.qrItemBadge}>
                          {item.product?.name || "Product"} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.qrImageBox}>
                    {group.shop?.aba_qr_url ? (
                      <img
                        src={group.shop.aba_qr_url}
                        alt="ABA QR"
                        style={styles.qrImage}
                      />
                    ) : (
                      <div style={styles.noQrBox}>
                        No ABA QR uploaded by this shop.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.deliveryFeeNote}>
              Delivery fee is not included in the QR payment. Please pay the
              delivery fee separately to the delivery person.
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() =>
                  setAbaModal({
                    show: false,
                    order: null,
                    form: null,
                  })
                }
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  opacity: checkingOut ? 0.7 : 1,
                }}
                disabled={checkingOut}
                onClick={() => submitCheckout(abaModal.order.id, abaModal.form)}
              >
                {checkingOut ? "Processing..." : "I Have Paid / Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Customer</p>
            <h1 style={styles.title}>My Orders</h1>
            <p style={styles.subtitle}>
              Checkout anytime. Shop owners may reject unavailable products.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/customer/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            text="When you order products, your orders will appear here."
            buttonText="Start Shopping"
            onClick={() => navigate("/")}
          />
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => {
              const checkoutForm = getCheckoutForm(order.id);
              const checkoutTotal = getCheckoutTotal(order);
              const rejectedTotal = getRejectedTotal(order);

              return (
                <div key={order.id} style={styles.card}>
                  <div style={styles.orderTop}>
                    <div>
                      <h3 style={styles.itemTitle}>Order #{order.id}</h3>

                      <p style={styles.itemText}>
                        {order.order_date
                          ? new Date(order.order_date).toLocaleString()
                          : order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "No date"}
                      </p>

                      <p style={styles.itemText}>
                        Type:{" "}
                        <strong>
                          {order.order_type
                            ? formatStatus(order.order_type)
                            : "Not selected"}
                        </strong>
                      </p>

                      {order.order_type !== "pickup" && (
                        <p style={styles.itemText}>
                          Payment:{" "}
                          <strong>
                            {order.payment_method
                              ? formatStatus(order.payment_method)
                              : "Not selected"}
                          </strong>
                        </p>
                      )}

                      {order.pickup_date && (
                        <p style={styles.itemText}>
                          Pickup Date:{" "}
                          <strong>
                            {new Date(order.pickup_date).toLocaleString()}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div style={styles.orderSummary}>
                      <strong style={styles.total}>
                        ${checkoutTotal.toFixed(2)}
                      </strong>

                      {hasRejectedItems(order) && (
                        <p style={styles.rejectedTotal}>
                          Rejected not counted: ${rejectedTotal.toFixed(2)}
                        </p>
                      )}

                      <p>
                        <span style={getOrderStatusStyle(order.status)}>
                          {getOrderStatusLabel(order)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div style={styles.addressBox}>
                    <strong>
                      {order.order_type === "pickup"
                        ? "Pickup Note:"
                        : "Delivery Address:"}
                    </strong>{" "}
                    {order.order_type === "pickup"
                      ? "Please pick up from the shop."
                      : order.delivery_address}
                  </div>

                  <div style={styles.products}>
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          ...styles.productRow,
                          ...(item.status === "rejected"
                            ? styles.rejectedProductRow
                            : {}),
                        }}
                        onClick={() => {
                          const productId = item.product?.id || item.product_id;

                          if (productId) {
                            navigate(`/products/${productId}`);
                          }
                        }}
                        title="View product details"
                      >
                        <img
                          src={
                            item.product?.image_url ||
                            item.product?.thumbnail ||
                            item.product?.image ||
                            "https://via.placeholder.com/80"
                          }
                          alt={item.product?.name || "Product"}
                          style={styles.image}
                        />

                        <div style={styles.productInfo}>
                          <h4 style={styles.productName}>
                            {item.product?.name || "Product"}
                          </h4>

                          <p style={styles.itemText}>
                            Qty: {item.quantity} × $
                            {Number(item.price || 0).toFixed(2)}
                          </p>

                          {item.status === "rejected" && (
                            <p style={styles.rejectReason}>
                              This product will not be included in checkout.
                            </p>
                          )}

                          {item.status === "rejected" && item.reject_reason && (
                            <p style={styles.rejectReason}>
                              Reason: {item.reject_reason}
                            </p>
                          )}
                        </div>

                        <span style={getItemStatusStyle(item.status)}>
                          {getItemBanner(item.status)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {canCheckout(order) && (
                    <div style={styles.checkoutBox}>
                      <h4 style={styles.checkoutTitle}>Checkout Option</h4>
                      <p style={styles.checkoutNote}>
                        You can checkout now. If a shop owner later rejects an
                        unavailable product, it will be removed from your order
                        total.
                      </p>

                      <div style={styles.checkoutGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Order Type</label>

                          <select
                            value={checkoutForm.order_type}
                            onChange={(e) =>
                              updateCheckoutForm(
                                order.id,
                                "order_type",
                                e.target.value
                              )
                            }
                            style={styles.select}
                          >
                            <option value="delivery">Delivery</option>
                            <option value="pickup">Pickup</option>
                          </select>

                          {checkoutForm.order_type === "delivery" && (
                            <p style={styles.deliveryNote}>
                              Note: Delivery fee is paid separately to the
                              delivery person.
                            </p>
                          )}
                        </div>

                        {checkoutForm.order_type === "delivery" && (
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Payment Method</label>

                            <select
                              value={checkoutForm.payment_method}
                              onChange={(e) =>
                                updateCheckoutForm(
                                  order.id,
                                  "payment_method",
                                  e.target.value
                                )
                              }
                              style={styles.select}
                            >
                              <option value="cash">Pay in Cash</option>
                              <option value="online">Pay Online</option>
                            </select>
                          </div>
                        )}

                        {checkoutForm.order_type === "pickup" && (
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Pickup Date</label>

                            <input
                              type="datetime-local"
                              value={checkoutForm.pickup_date}
                              onChange={(e) =>
                                updateCheckoutForm(
                                  order.id,
                                  "pickup_date",
                                  e.target.value
                                )
                              }
                              style={styles.select}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={{
                        ...styles.cancelButton,
                        opacity: canCancel(order) ? 1 : 0.6,
                      }}
                      disabled={!canCancel(order)}
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>

                    <button
                      type="button"
                      style={{
                        ...styles.primaryButton,
                        opacity: canCheckout(order) ? 1 : 0.5,
                      }}
                      disabled={!canCheckout(order)}
                      onClick={() => checkoutOrder(order)}
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

function EmptyState({ icon, title, text, buttonText, onClick }) {
  return (
    <div style={styles.emptyCard}>
      <div style={styles.emptyIcon}>{icon}</div>
      <h2 style={styles.emptyTitle}>{title}</h2>
      <p style={styles.emptyText}>{text}</p>
      <button type="button" style={styles.primaryButton} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
}

const formatStatus = (status) => {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getItemBanner = (status) => {
  if (status === "rejected") return "Rejected";
  if (status === "ready") return "Ready";
  return "Ordered";
};

const activeItemsReady = (order) => {
  const activeItems = (order.items || []).filter(
    (item) => item.status !== "rejected"
  );

  if (activeItems.length === 0) return false;

  return activeItems.every((item) => item.status === "ready");
};

const getOrderStatusLabel = (order) => {
  if (order.status === "in_transit") return "Delivering";
  if (order.status === "delivered") return "Delivered";

  if (order.status === "ready_for_delivery" && order.order_type === "pickup") {
    return activeItemsReady(order) ? "Ready For Pickup" : "Pickup Requested";
  }

  if (order.status === "ready_for_delivery" && order.order_type === "delivery") {
    return "Ready For Delivery";
  }

  if (order.status === "partially_rejected") return "Some Products Rejected";
  if (order.status === "pending") return "Ordered";

  return formatStatus(order.status);
};

const getOrderStatusStyle = (status) => ({
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  background:
    status === "ready_for_delivery"
      ? "#dcfce7"
      : status === "in_transit"
      ? "#dbeafe"
      : status === "delivered"
      ? "#dcfce7"
      : status === "partially_rejected"
      ? "#fee2e2"
      : status === "cancelled"
      ? "#f3f4f6"
      : "#fef9c3",
  color:
    status === "ready_for_delivery"
      ? "#166534"
      : status === "in_transit"
      ? "#1d4ed8"
      : status === "delivered"
      ? "#166534"
      : status === "partially_rejected"
      ? "#991b1b"
      : status === "cancelled"
      ? "#374151"
      : "#854d0e",
});

const getItemStatusStyle = (status) => ({
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  whiteSpace: "nowrap",
  background:
    status === "ready"
      ? "#dcfce7"
      : status === "rejected"
      ? "#fee2e2"
      : "#fef9c3",
  color:
    status === "ready"
      ? "#166534"
      : status === "rejected"
      ? "#991b1b"
      : "#854d0e",
});

const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
  },
  main: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.primary,
  },
  toast: {
    position: "fixed",
    top: 90,
    right: 24,
    background: COLORS.dark,
    color: COLORS.white,
    padding: "12px 18px",
    borderRadius: 12,
    zIndex: 999,
    fontWeight: 800,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.48)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  paymentModal: {
    width: "min(900px, 96vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: COLORS.white,
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  modalTitle: {
    margin: 0,
    color: COLORS.dark,
    fontSize: "clamp(22px, 4vw, 26px)",
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    fontSize: 24,
    cursor: "pointer",
    fontWeight: 900,
  },
  qrList: {
    display: "grid",
    gap: 14,
  },
  qrCard: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 210px",
    gap: 16,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 14,
    background: "#f9fafb",
  },
  qrInfo: {
    minWidth: 0,
  },
  qrShopName: {
    margin: "0 0 8px",
    color: COLORS.dark,
  },
  qrText: {
    margin: "5px 0",
    color: COLORS.muted,
  },
  qrItems: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  qrItemBadge: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 800,
    fontSize: 13,
    color: COLORS.dark,
  },
  qrImageBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 190,
    height: 190,
    objectFit: "contain",
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
  },
  noQrBox: {
    width: 190,
    height: 190,
    border: "1px dashed #d1d5db",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    textAlign: "center",
    color: COLORS.red,
    fontWeight: 800,
    background: COLORS.white,
  },
  deliveryFeeNote: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    fontWeight: 900,
  },
  modalActions: {
    marginTop: 18,
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  secondaryButton: {
    background: "#f3f4f6",
    color: COLORS.dark,
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    color: COLORS.dark,
  },
  subtitle: {
    margin: "6px 0 0",
    color: COLORS.muted,
  },
  backButton: {
    background: COLORS.white,
    color: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  orderList: {
    display: "grid",
    gap: 20,
  },
  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "clamp(16px, 2.5vw, 20px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 14,
    flexWrap: "wrap",
  },
  orderSummary: {
    textAlign: "right",
  },
  itemTitle: {
    margin: 0,
    color: COLORS.dark,
  },
  itemText: {
    margin: "4px 0 0",
    color: COLORS.muted,
  },
  total: {
    color: COLORS.primaryDark,
    fontSize: 22,
  },
  rejectedTotal: {
    color: COLORS.red,
    margin: "5px 0 0",
    fontSize: 13,
    fontWeight: 800,
  },
  addressBox: {
    marginTop: 14,
    padding: 12,
    background: "#f9fafb",
    borderRadius: 12,
    color: COLORS.dark,
  },
  products: {
    marginTop: 14,
    display: "grid",
    gap: 12,
  },
  productRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 14,
    padding: 12,
    cursor: "pointer",
    transition: "0.2s ease",
    flexWrap: "wrap",
  },
  rejectedProductRow: {
    background: "#fff7f7",
    border: "1px solid #fecaca",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    objectFit: "cover",
    background: "#f3f4f6",
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    minWidth: 180,
  },
  productName: {
    margin: 0,
    color: COLORS.dark,
  },
  rejectReason: {
    margin: "6px 0 0",
    color: COLORS.red,
    fontWeight: 700,
  },
  checkoutBox: {
    marginTop: 16,
    background: "#f9fafb",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 14,
  },
  checkoutTitle: {
    margin: "0 0 6px",
    color: COLORS.dark,
  },
  checkoutNote: {
    margin: "0 0 12px",
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: 700,
  },
  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontWeight: 800,
    color: COLORS.dark,
    fontSize: 14,
  },
  select: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "11px",
    fontWeight: 700,
    background: COLORS.white,
  },
  actions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  cancelButton: {
    background: "#fff0f1",
    color: COLORS.red,
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  primaryButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  emptyCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 22,
    padding: "50px 24px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 14,
  },
  emptyTitle: {
    margin: 0,
    color: COLORS.dark,
  },
  emptyText: {
    color: COLORS.muted,
    margin: "10px 0 22px",
  },
  deliveryNote: {
    margin: "8px 0 0",
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: 800,
  },
};

export default CustomerOrdersPage;