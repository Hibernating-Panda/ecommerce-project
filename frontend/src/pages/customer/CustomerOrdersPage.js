import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import MapPickerModal from "../../components/common/MapPickerModal";

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
  blue: "#2563eb",
};

const HISTORY_STATUSES = ["cancelled", "delivered", "completed"];

const defaultModal = {
  show: false,
  order: null,
  form: null,
  preview: null,
  payment: null,
};

const CustomerOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");
  const [checkoutForms, setCheckoutForms] = useState({});
  const [mapPicker, setMapPicker] = useState({
    open: false,
    orderId: null,
  });

  const [abaModal, setAbaModal] = useState(defaultModal);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [previewLoading, setPreviewLoading] = useState({});

  useEffect(() => {
    fetchPageData();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2800);
  };

  const resetAbaModal = () => {
    setAbaModal(defaultModal);
  };

  const fetchPageData = async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        api.get("/customer/orders"),
        api.get("/profile"),
      ]);

      const orderList = ordersRes.data.orders || ordersRes.data.data || [];
      const activeOrders = filterActiveOrders(orderList);
      const user = profileRes.data.user || profileRes.data;

      setOrders(activeOrders);

      setProfile({
        address: user?.address || "",
        latitude: user?.latitude || "",
        longitude: user?.longitude || "",
      });

      setCheckoutForms((prev) => {
        const next = { ...prev };

        activeOrders.forEach((order) => {
          if (!next[order.id]) {
            next[order.id] = {
              order_type: "delivery",
              payment_method: "cash",
              pickup_date: "",
              delivery_address: order.delivery_address || user?.address || "",
              delivery_lat: order.delivery_lat || user?.latitude || "",
              delivery_lng: order.delivery_lng || user?.longitude || "",
              preview: null,
            };
          }
        });

        return next;
      });
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to load orders.");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/customer/orders");
      const orderList = res.data.orders || res.data.data || [];
      setOrders(filterActiveOrders(orderList));
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to load orders.");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      showMessage(res.data.message || "Order cancelled.");
      fetchOrders();
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to cancel order.");
    }
  };

  const updateCheckoutForm = (orderId, field, value) => {
    setCheckoutForms((prev) => ({
      ...prev,
      [orderId]: {
        order_type: "delivery",
        payment_method: "cash",
        pickup_date: "",
        delivery_address: profile.address || "",
        delivery_lat: profile.latitude || "",
        delivery_lng: profile.longitude || "",
        preview: null,
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
        delivery_address: profile.address || "",
        delivery_lat: profile.latitude || "",
        delivery_lng: profile.longitude || "",
        preview: null,
      }
    );
  };

  const previewCheckout = async (orderId) => {
    const form = getCheckoutForm(orderId);

    if (form.order_type === "delivery") {
      if (!form.delivery_address) {
        showMessage("Please enter your delivery address.");
        return null;
      }

      if (!form.delivery_lat || !form.delivery_lng) {
        showMessage("Please pick your delivery location on the map.");
        return null;
      }
    }

    try {
      setPreviewLoading((prev) => ({
        ...prev,
        [orderId]: true,
      }));

      const res = await api.post(`/orders/${orderId}/checkout-preview`, {
        order_type: form.order_type,
        delivery_address:
          form.order_type === "delivery" ? form.delivery_address : null,
        delivery_lat: form.order_type === "delivery" ? form.delivery_lat : null,
        delivery_lng: form.order_type === "delivery" ? form.delivery_lng : null,
        pickup_date: form.order_type === "pickup" ? form.pickup_date : null,
      });

      const preview = res.data;

      setCheckoutForms((prev) => ({
        ...prev,
        [orderId]: {
          ...getCheckoutForm(orderId),
          preview,
        },
      }));

      return preview;
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Failed to calculate delivery fee."
      );
      return null;
    } finally {
      setPreviewLoading((prev) => ({
        ...prev,
        [orderId]: false,
      }));
    }
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

    if (form.order_type === "delivery" && !form.delivery_address) {
      showMessage("Please enter your delivery address.");
      return;
    }

    if (
      form.order_type === "delivery" &&
      (!form.delivery_lat || !form.delivery_lng)
    ) {
      showMessage("Please pick your delivery location on the map.");
      return;
    }

    const preview = form.preview || (await previewCheckout(order.id));

    if (!preview) return;

    if (form.order_type === "delivery" && form.payment_method === "online") {
      await submitOnlineCheckout(order.id, form, preview);
      return;
    }

    await submitCheckout(order.id, form);
  };

  const submitCheckout = async (orderId, form) => {
    setCheckingOut(true);

    try {
      const res = await api.put(`/orders/${orderId}/checkout`, {
        order_type: form.order_type,
        payment_method:
          form.order_type === "delivery" ? form.payment_method : null,
        pickup_date: form.order_type === "pickup" ? form.pickup_date : null,
        delivery_address:
          form.order_type === "delivery" ? form.delivery_address : null,
        delivery_lat: form.order_type === "delivery" ? form.delivery_lat : null,
        delivery_lng: form.order_type === "delivery" ? form.delivery_lng : null,
      });

      resetAbaModal();
      showMessage(res.data.message || "Order checkout completed.");
      fetchOrders();
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to checkout order.");
    } finally {
      setCheckingOut(false);
    }
  };

  const submitOnlineCheckout = async (orderId, form, preview) => {
    setCheckingOut(true);

    try {
      const checkoutRes = await api.put(`/orders/${orderId}/checkout`, {
        order_type: form.order_type,
        payment_method: "online",
        pickup_date: null,
        delivery_address: form.delivery_address,
        delivery_lat: form.delivery_lat,
        delivery_lng: form.delivery_lng,
      });

      setAbaModal({
        show: true,
        order: checkoutRes.data.order,
        form,
        preview,
        payment: checkoutRes.data.order?.payment || null,
      });

      showMessage("Online payment simulation started.");
      fetchOrders();
    } catch (error) {
      console.error("Online payment checkout error:", error.response?.data || error);

      showMessage(
        error.response?.data?.message ||
          "Failed to start online payment simulation."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!abaModal.order?.id) return;

    setCheckingPayment(true);

    try {
      const res = await api.put(
        `/orders/${abaModal.order.id}/simulate-payment-success`
      );

      showMessage(res.data.message || "Payment simulated successfully.");

      resetAbaModal();
      fetchOrders();
    } catch (error) {
      console.error("Simulate payment success error:", error.response?.data || error);
      showMessage(
        error.response?.data?.message || "Failed to simulate payment success."
      );
    } finally {
      setCheckingPayment(false);
    }
  };

  const simulatePaymentFailed = async () => {
    if (!abaModal.order?.id) return;

    setCheckingPayment(true);

    try {
      const res = await api.put(
        `/orders/${abaModal.order.id}/simulate-payment-failed`
      );

      setAbaModal((prev) => ({
        ...prev,
        payment: res.data.payment,
      }));

      showMessage(res.data.message || "Payment simulated as failed.");
      fetchOrders();
    } catch (error) {
      console.error("Simulate payment failed error:", error.response?.data || error);
      showMessage(
        error.response?.data?.message || "Failed to simulate payment failed."
      );
    } finally {
      setCheckingPayment(false);
    }
  };

  const canCheckout = (order) => {
    const activeItems = (order.items || []).filter(
      (item) => item.status !== "rejected"
    );

    if (activeItems.length === 0) return false;

    return ["pending", "partially_rejected"].includes(order.status);
  };

  const canCancel = (order) => {
    return !["cancelled", "in_transit", "delivered", "completed"].includes(
      order.status
    );
  };

  const canTrackDelivery = (order) => {
    if (order.order_type !== "delivery") return false;

    const hasDelivery =
      Boolean(order.delivery) ||
      Boolean(order.deliveries && order.deliveries.length > 0);

    return (
      hasDelivery ||
      ["ready_for_delivery", "in_transit", "delivered"].includes(order.status)
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

  const normalizeProductImage = (image) => {
    if (!image) return "https://via.placeholder.com/80";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

    if (image.startsWith("storage/")) {
      return `${baseUrl}/${image}`;
    }

    return `${baseUrl}/storage/${image}`;
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <MapPickerModal
        open={mapPicker.open}
        initialLat={
          mapPicker.orderId ? getCheckoutForm(mapPicker.orderId).delivery_lat : ""
        }
        initialLng={
          mapPicker.orderId ? getCheckoutForm(mapPicker.orderId).delivery_lng : ""
        }
        onClose={() => setMapPicker({ open: false, orderId: null })}
        onSelect={({ latitude, longitude }) => {
          if (!mapPicker.orderId) return;

          updateCheckoutForm(mapPicker.orderId, "delivery_lat", latitude);
          updateCheckoutForm(mapPicker.orderId, "delivery_lng", longitude);
        }}
      />

      {abaModal.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.paymentModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Online Payment Simulation</h2>
                <p style={styles.modalSubtitle}>
                  This simulates ABA PayWay payment while waiting for domain
                  whitelisting.
                </p>
              </div>

              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={resetAbaModal}
              >
                ×
              </button>
            </div>

            <div style={styles.totalPreviewBox}>
              <div>
                <span>Product Subtotal: </span>
                <strong>
                  ${Number(abaModal.preview?.subtotal || 0).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Delivery Distance: </span>
                <strong>
                  {Number(abaModal.preview?.delivery_distance_km || 0).toFixed(2)} km
                </strong>
              </div>

              <div>
                <span>Delivery Fee: </span>
                <strong>
                  ${Number(abaModal.preview?.delivery_fee || 0).toFixed(2)}
                </strong>
              </div>

              <div style={styles.finalTotalRow}>
                <span>Final Total: </span>
                <strong>
                  ${Number(abaModal.preview?.total || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={styles.paywayInfoOnly}>
              <h3 style={styles.paywayTitle}>Simulated Online Payment</h3>

              <p style={styles.paywayText}>
                Order: <strong>#{abaModal.order?.id}</strong>
              </p>

              <p style={styles.paywayText}>
                Provider: <strong>ABA PayWay Simulation</strong>
              </p>

              <p style={styles.paywayText}>
                Status:{" "}
                <strong>
                  {abaModal.payment?.status
                    ? formatStatus(abaModal.payment.status)
                    : "Pending"}
                </strong>
              </p>

              {abaModal.payment?.transaction_id && (
                <p style={styles.paywayText}>
                  Transaction ID:{" "}
                  <strong>{abaModal.payment.transaction_id}</strong>
                </p>
              )}

              <div style={styles.paymentSteps}>
                <strong>Demo Steps:</strong>
                <ol>
                  <li>Customer chooses online payment.</li>
                  <li>System creates a pending payment record.</li>
                  <li>Click success to simulate PayWay confirmation.</li>
                  <li>Payment status becomes paid.</li>
                </ol>
              </div>

              <div style={styles.simulationActions}>
                <button
                  type="button"
                  style={{
                    ...styles.simSuccessButton,
                    opacity: checkingPayment ? 0.7 : 1,
                  }}
                  disabled={checkingPayment}
                  onClick={simulatePaymentSuccess}
                >
                  {checkingPayment ? "Processing..." : "Simulate Payment Success"}
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.simFailedButton,
                    opacity: checkingPayment ? 0.7 : 1,
                  }}
                  disabled={checkingPayment}
                  onClick={simulatePaymentFailed}
                >
                  Simulate Payment Failed
                </button>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={resetAbaModal}
              >
                Close
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
              Checkout active orders. Completed and cancelled orders are moved
              to history.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.historyButton}
              onClick={() => navigate("/customer/order-history")}
            >
              Order History
            </button>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/customer/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No active orders"
            text="Completed and cancelled orders are in Order History."
            buttonText="Start Shopping"
            onClick={() => navigate("/")}
          />
        ) : (
          <div style={styles.orderList}>
            {orders.map((order) => {
              const checkoutForm = getCheckoutForm(order.id);
              const preview = checkoutForm.preview;
              const checkoutTotal = getCheckoutTotal(order);
              const rejectedTotal = getRejectedTotal(order);
              const paymentStatus = order.payment?.status;

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

                      {paymentStatus && (
                        <p style={styles.itemText}>
                          Payment Status:{" "}
                          <strong>{formatStatus(paymentStatus)}</strong>
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
                        ${Number(order.total || checkoutTotal).toFixed(2)}
                      </strong>

                      {Number(order.delivery_fee || 0) > 0 && (
                        <p style={styles.deliverySavedFee}>
                          Delivery fee: $
                          {Number(order.delivery_fee || 0).toFixed(2)}
                        </p>
                      )}

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

                  {order.order_type === "pickup" && (
                    <div style={styles.addressBox}>
                      <strong>Pickup Note:</strong> Please pick up from the shop.
                    </div>
                  )}

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
                          title="View product details"
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

                            {item.status === "rejected" && (
                              <p style={styles.rejectReason}>
                                This product will not be included in checkout.
                              </p>
                            )}

                            {item.status === "rejected" &&
                              item.reject_reason && (
                                <p style={styles.rejectReason}>
                                  Reason: {item.reject_reason}
                                </p>
                              )}
                          </div>

                          <span style={getItemStatusStyle(item.status)}>
                            {getItemBanner(item.status)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {canCheckout(order) && (
                    <div style={styles.checkoutBox}>
                      <h4 style={styles.checkoutTitle}>Checkout Option</h4>
                      <p style={styles.checkoutNote}>
                        Delivery fee is calculated from the shop location to
                        your selected delivery location.
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

                      {checkoutForm.order_type === "delivery" && (
                        <div style={styles.deliveryLocationBox}>
                          <label style={styles.label}>Delivery Address</label>

                          <div style={styles.addressRow}>
                            <input
                              style={styles.input}
                              value={checkoutForm.delivery_address}
                              onChange={(e) =>
                                updateCheckoutForm(
                                  order.id,
                                  "delivery_address",
                                  e.target.value
                                )
                              }
                              placeholder="Enter delivery address"
                            />

                            <button
                              type="button"
                              style={styles.mapButton}
                              onClick={() =>
                                setMapPicker({
                                  open: true,
                                  orderId: order.id,
                                })
                              }
                            >
                              Pick on Map
                            </button>
                          </div>

                          {checkoutForm.delivery_lat &&
                          checkoutForm.delivery_lng ? (
                            <p style={styles.locationText}>
                              Location selected:{" "}
                              {Number(checkoutForm.delivery_lat).toFixed(6)},{" "}
                              {Number(checkoutForm.delivery_lng).toFixed(6)}
                            </p>
                          ) : (
                            <p style={styles.noLocationText}>
                              No delivery map location selected.
                            </p>
                          )}

                          <button
                            type="button"
                            style={{
                              ...styles.previewButton,
                              opacity: previewLoading[order.id] ? 0.7 : 1,
                            }}
                            disabled={previewLoading[order.id]}
                            onClick={() => previewCheckout(order.id)}
                          >
                            {previewLoading[order.id]
                              ? "Calculating..."
                              : "Calculate Delivery Fee"}
                          </button>
                        </div>
                      )}

                      {preview && (
                        <div style={styles.previewBox}>
                          <div>
                            <span>Product Subtotal: </span>
                            <strong>
                              ${Number(preview.subtotal || 0).toFixed(2)}
                            </strong>
                          </div>

                          <div>
                            <span>Distance: </span>
                            <strong>
                              {Number(
                                preview.delivery_distance_km || 0
                              ).toFixed(2)}{" "}
                              km
                            </strong>
                          </div>

                          <div>
                            <span>Delivery Fee: </span>
                            <strong>
                              ${Number(preview.delivery_fee || 0).toFixed(2)}
                            </strong>
                          </div>

                          <div style={styles.finalTotalRow}>
                            <span>Final Total: </span>
                            <strong>
                              ${Number(preview.total || 0).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={styles.actions}>
                    {canTrackDelivery(order) && (
                      <button
                        type="button"
                        style={styles.trackButton}
                        onClick={() =>
                          navigate(`/customer/orders/${order.id}/track`)
                        }
                      >
                        Track Delivery
                      </button>
                    )}

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
                        opacity: canCheckout(order) || checkingOut ? 1 : 0.5,
                      }}
                      disabled={!canCheckout(order) || checkingOut}
                      onClick={() => checkoutOrder(order)}
                    >
                      {checkingOut ? "Processing..." : "Checkout"}
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

function filterActiveOrders(orders) {
  return (orders || []).filter(
    (order) => !HISTORY_STATUSES.includes(order.status)
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
    width: "min(720px, 96vw)",
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

  totalPreviewBox: {
    display: "grid",
    gap: 10,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontWeight: 900,
  },

  paywayInfoOnly: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 16,
    background: "#f9fafb",
  },

  paywayTitle: {
    margin: "0 0 10px",
    color: COLORS.dark,
  },

  paywayText: {
    margin: "6px 0",
    color: COLORS.muted,
    overflowWrap: "anywhere",
  },

  paymentSteps: {
    marginTop: 14,
    background: COLORS.white,
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 12,
    padding: 12,
    color: COLORS.dark,
  },

  simulationActions: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  simSuccessButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  simFailedButton: {
    background: "#fff0f1",
    color: COLORS.red,
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
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

  checkPaymentButton: {
    background: COLORS.blue,
    color: COLORS.white,
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

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  historyButton: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    padding: "10px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
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

  deliveryLocationBox: {
    marginTop: 14,
    display: "grid",
    gap: 8,
  },

  addressRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 10,
  },

  input: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "11px",
    fontWeight: 700,
    background: COLORS.white,
    width: "100%",
    boxSizing: "border-box",
  },

  mapButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  locationText: {
    margin: 0,
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: 800,
  },

  noLocationText: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 800,
  },

  previewButton: {
    justifySelf: "start",
    background: COLORS.primaryDark,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  previewBox: {
    display: "grid",
    gap: 10,
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    fontWeight: 900,
    color: COLORS.dark,
  },

  finalTotalRow: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 10,
    color: COLORS.primaryDark,
    fontSize: 18,
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

  trackButton: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
};

export default CustomerOrdersPage;