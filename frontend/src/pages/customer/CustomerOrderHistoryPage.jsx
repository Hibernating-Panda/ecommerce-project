import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

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

const HISTORY_STATUSES = ["cancelled", "delivered", "completed"];

function CustomerOrderHistoryPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await api.get("/customer/orders");
      const orderList = res.data.orders || res.data.data || [];

      setOrders(
        orderList.filter((order) => HISTORY_STATUSES.includes(order.status))
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Customer</p>
            <h1 style={styles.title}>Order History</h1>
            <p style={styles.subtitle}>
              Completed, delivered, and cancelled orders are shown here.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/customer/orders")}
          >
            Back to Active Orders
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📦</div>
            <h2>Loading history...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📜</div>
            <h2>No order history yet</h2>
            <p style={styles.emptyText}>
              Completed and cancelled orders will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => (
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

                    {order.payment_method && (
                      <p style={styles.itemText}>
                        Payment: <strong>{formatStatus(order.payment_method)}</strong>
                      </p>
                    )}
                  </div>

                  <div style={styles.orderSummary}>
                    <strong style={styles.total}>
                      ${Number(order.total || getOrderTotal(order)).toFixed(2)}
                    </strong>

                    {Number(order.delivery_fee || 0) > 0 && (
                      <p style={styles.deliverySavedFee}>
                        Includes delivery: $
                        {Number(order.delivery_fee || 0).toFixed(2)}
                      </p>
                    )}

                    <p>
                      <span style={getOrderStatusStyle(order.status)}>
                        {formatStatus(order.status)}
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
                    ? "Customer selected pickup."
                    : order.delivery_address || "No delivery address."}
                </div>

                <div style={styles.products}>
                  {(order.items || []).map((item) => {
                    const size = getOrderItemSize(item);

                    return (
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
                      >
                        <img
                          src={normalizeProductImage(
                            item.product?.image_url ||
                              item.product?.thumbnail ||
                              item.product?.image
                          )}
                          alt={item.product?.name || "Product"}
                          style={styles.image}
                        />

                        <div style={styles.productInfo}>
                          <h4 style={styles.productName}>
                            {item.product?.name || "Product"}
                          </h4>

                          {size && (
                            <div style={styles.sizeRow}>
                              <span style={styles.sizeLabel}>Size</span>
                              <span style={styles.sizeChip}>{size}</span>
                            </div>
                          )}

                          <p style={styles.itemText}>
                            Qty: {item.quantity} × $
                            {Number(item.price || 0).toFixed(2)}
                          </p>

                          {item.status === "rejected" && item.reject_reason && (
                            <p style={styles.rejectReason}>
                              Reason: {item.reject_reason}
                            </p>
                          )}
                        </div>

                        <span style={getItemStatusStyle(item.status)}>
                          {formatStatus(item.status || "ordered")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getOrderItemSize(item) {
  return (
    item?.product_size?.size ||
    item?.productSize?.size ||
    item?.size ||
    item?.selected_size ||
    ""
  );
}

function getOrderTotal(order) {
  return (order.items || [])
    .filter((item) => item.status !== "rejected")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
}

function normalizeProductImage(image) {
  if (!image) return "https://via.placeholder.com/80";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

  if (image.startsWith("storage/")) {
    return `${baseUrl}/${image}`;
  }

  return `${baseUrl}/storage/${image}`;
}

const formatStatus = (status) => {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getOrderStatusStyle = (status) => ({
  display: "inline-block",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  background:
    status === "delivered" || status === "completed"
      ? "#dcfce7"
      : status === "cancelled"
      ? "#f3f4f6"
      : "#fef9c3",
  color:
    status === "delivered" || status === "completed"
      ? "#166534"
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
  deliverySavedFee: {
    color: COLORS.primaryDark,
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
  sizeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  sizeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  sizeChip: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 999,
    padding: "3px 9px",
    fontSize: 12,
    fontWeight: 900,
  },
  rejectReason: {
    margin: "6px 0 0",
    color: COLORS.red,
    fontWeight: 700,
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
  emptyText: {
    color: COLORS.muted,
    margin: "10px 0 22px",
  },
};

export default CustomerOrderHistoryPage;