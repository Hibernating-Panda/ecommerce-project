import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
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
  blue: "#2563eb",
  yellow: "#facc15",
};

const TrackDeliveryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deliveredModal, setDeliveredModal] = useState(false);

  const hasHandledDeliveredRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchTracking(true);

    intervalRef.current = setInterval(() => {
      fetchTracking(false);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2800);
  };

  const handleDelivered = () => {
    if (hasHandledDeliveredRef.current) return;

    hasHandledDeliveredRef.current = true;
    setDeliveredModal(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimeout(() => {
      window.close();
      navigate("/customer/order-history");
    }, 3500);
  };

  const fetchTracking = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const res = await api.get(`/customer/orders/${id}/track`);
      setTrackingData(res.data);

      const deliveryStatus = res.data?.delivery?.status;
      const orderStatus = res.data?.order?.status;

      if (deliveryStatus === "delivered" || orderStatus === "delivered") {
        handleDelivered();
      }
    } catch (error) {
      console.error("Track delivery error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to load tracking.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const order = trackingData?.order || null;
  const delivery = trackingData?.delivery || null;
  const tracking = trackingData?.tracking || null;

  const pickup = tracking?.pickup || {};
  const destination = tracking?.destination || {};
  const driver = tracking?.driver || {};

  const pickupPosition = getPosition(pickup.lat, pickup.lng);
  const destinationPosition = getPosition(destination.lat, destination.lng);
  const driverPosition = getPosition(driver.lat, driver.lng);

  const mapCenter =
    driverPosition || pickupPosition || destinationPosition || [11.5564, 104.9282];

  const routePoints = useMemo(() => {
    const points = [];

    if (delivery?.status === "going_to_shop") {
      if (driverPosition) points.push(driverPosition);
      if (pickupPosition) points.push(pickupPosition);
      return points;
    }

    if (delivery?.status === "in_transit") {
      if (driverPosition) points.push(driverPosition);
      if (destinationPosition) points.push(destinationPosition);
      return points;
    }

    if (pickupPosition) points.push(pickupPosition);
    if (destinationPosition) points.push(destinationPosition);

    return points;
  }, [delivery?.status, driverPosition, pickupPosition, destinationPosition]);

  const openRoute = (lat, lng) => {
    if (!lat || !lng) {
      showMessage("No map location available.");
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openCurrentTargetRoute = () => {
    if (!delivery) return;

    if (delivery.status === "going_to_shop") {
      openRoute(pickup.lat, pickup.lng);
      return;
    }

    openRoute(destination.lat, destination.lng);
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.emptyCard}>Loading delivery tracking...</div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.emptyCard}>Order not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      {deliveredModal && (
        <div style={styles.deliveredOverlay}>
          <div style={styles.deliveredBox}>
            <div style={styles.deliveredIcon}>✅</div>
            <h2 style={styles.deliveredTitle}>Order Delivered</h2>
            <p style={styles.deliveredText}>
              Your order has been delivered successfully.
            </p>
            <p style={styles.deliveredSmallText}>
              This tracking page will close or move to Order History.
            </p>

            <button
              type="button"
              style={styles.deliveredButton}
              onClick={() => navigate("/customer/order-history")}
            >
              Go to Order History
            </button>
          </div>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.kicker}>Customer Tracking</p>
            <h1 style={styles.title}>Track Order #{order.id}</h1>
            <p style={styles.subtitle}>
              This page refreshes every 5 seconds while delivery is active.
            </p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/customer/orders")}
          >
            Back to Orders
          </button>
        </div>

        {!delivery ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🛵</div>
            <h2>No delivery task yet</h2>
            <p style={styles.emptyText}>
              The shop may still be preparing your order. Tracking will appear
              after delivery is created.
            </p>
          </div>
        ) : (
          <>
            <section style={styles.statusCard}>
              <div>
                <p style={styles.statusLabel}>Delivery Status</p>
                <h2 style={styles.statusTitle}>
                  {getDeliveryStatusLabel(delivery.status)}
                </h2>
                <p style={styles.statusText}>
                  {getDeliveryStatusText(delivery.status)}
                </p>
              </div>

              <div style={styles.statusRight}>
                <span style={getStatusBadgeStyle(delivery.status)}>
                  {getDeliveryStatusLabel(delivery.status)}
                </span>

                <button
                  type="button"
                  style={styles.routeButton}
                  onClick={openCurrentTargetRoute}
                >
                  Open Current Route
                </button>
              </div>
            </section>

            <section style={styles.infoGrid}>
              <InfoCard
                icon="🏪"
                title="Pickup Shop"
                name={delivery.shop?.shop_name || "Shop"}
                address={pickup.address}
                coordinate={formatCoordinate(pickup.lat, pickup.lng)}
                buttonText="Shop Route"
                onClick={() => openRoute(pickup.lat, pickup.lng)}
              />

              <InfoCard
                icon="📍"
                title="Delivery Address"
                name={order.customer_name || order.customer?.name || "Customer"}
                address={destination.address}
                coordinate={formatCoordinate(destination.lat, destination.lng)}
                buttonText="Customer Route"
                onClick={() => openRoute(destination.lat, destination.lng)}
              />

              <InfoCard
                icon="🛵"
                title="Delivery Man"
                name={driver.label || "Waiting for driver"}
                address={driver.phone ? `Phone: ${driver.phone}` : "No phone"}
                coordinate={
                  driverPosition
                    ? formatCoordinate(driver.lat, driver.lng)
                    : "Driver location not shared yet"
                }
                buttonText="Driver Location"
                onClick={() => openRoute(driver.lat, driver.lng)}
                disabled={!driverPosition}
              />
            </section>

            <section style={styles.mapCard}>
              <div style={styles.mapHeader}>
                <div>
                  <h2 style={styles.mapTitle}>Live Delivery Map</h2>
                  <p style={styles.mapText}>
                    Shop, customer, and driver location will appear here.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.refreshButton}
                  onClick={() => fetchTracking(false)}
                >
                  Refresh
                </button>
              </div>

              <div style={styles.mapBox}>
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={styles.map}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {pickupPosition && (
                    <Marker position={pickupPosition} icon={shopIcon}>
                      <Popup>
                        <strong>Pickup Shop</strong>
                        <br />
                        {pickup.address || "No address"}
                      </Popup>
                    </Marker>
                  )}

                  {destinationPosition && (
                    <Marker position={destinationPosition} icon={homeIcon}>
                      <Popup>
                        <strong>Delivery Address</strong>
                        <br />
                        {destination.address || "No address"}
                      </Popup>
                    </Marker>
                  )}

                  {driverPosition && (
                    <Marker position={driverPosition} icon={driverIcon}>
                      <Popup>
                        <strong>{driver.label || "Delivery Man"}</strong>
                        <br />
                        {driver.updated_at
                          ? `Updated: ${new Date(driver.updated_at).toLocaleString()}`
                          : "Live location"}
                      </Popup>
                    </Marker>
                  )}

                  {routePoints.length >= 2 && (
                    <Polyline positions={routePoints} weight={5} />
                  )}
                </MapContainer>
              </div>
            </section>

            <section style={styles.itemsCard}>
              <h2 style={styles.sectionTitle}>Order Items</h2>

              <div style={styles.itemsList}>
                {(order.items || []).map((item) => {
                  const size = getOrderItemSize(item);

                  return (
                    <div key={item.id} style={styles.itemRow}>
                      <img
                        src={normalizeProductImage(
                          item.product?.image_url ||
                            item.product?.thumbnail ||
                            item.product?.image
                        )}
                        alt={item.product?.name || "Product"}
                        style={styles.itemImage}
                      />

                      <div style={styles.itemInfo}>
                        <strong>{item.product?.name || "Product"}</strong>

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
                      </div>

                      <span style={styles.itemStatus}>
                        {formatStatus(item.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

function InfoCard({
  icon,
  title,
  name,
  address,
  coordinate,
  buttonText,
  onClick,
  disabled = false,
}) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoIcon}>{icon}</div>

      <div style={styles.infoBody}>
        <p style={styles.infoTitle}>{title}</p>
        <h3 style={styles.infoName}>{name}</h3>
        <p style={styles.infoAddress}>{address || "No address"}</p>
        <p style={styles.coordinate}>{coordinate}</p>
      </div>

      <button
        type="button"
        style={{
          ...styles.smallRouteButton,
          opacity: disabled ? 0.55 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        disabled={disabled}
        onClick={onClick}
      >
        {buttonText}
      </button>
    </div>
  );
}

function getPosition(lat, lng) {
  if (!lat || !lng) return null;

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;

  return [parsedLat, parsedLng];
}

function formatCoordinate(lat, lng) {
  if (!lat || !lng) return "No coordinate";

  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
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

function getApiBaseUrl() {
  const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000/api";
  return baseUrl.replace(/\/api\/?$/, "");
}

function normalizeProductImage(image) {
  if (!image) return "/no-image.png";

  if (String(image).startsWith("http://") || String(image).startsWith("https://")) {
    return image;
  }

  if (String(image).startsWith("/storage/")) {
    return `${getApiBaseUrl()}${image}`;
  }

  if (String(image).startsWith("storage/")) {
    return `${getApiBaseUrl()}/${image}`;
  }

  return `${getApiBaseUrl()}/storage/${image}`;
}

function formatStatus(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDeliveryStatusLabel(status) {
  if (status === "available") return "Waiting For Driver";
  if (status === "going_to_shop") return "Driver Going To Shop";
  if (status === "in_transit") return "Driver Delivering";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";

  return formatStatus(status);
}

function getDeliveryStatusText(status) {
  if (status === "available") {
    return "Your order is ready. Waiting for a delivery man to accept it.";
  }

  if (status === "going_to_shop") {
    return "The delivery man is going to the shop to pick up your order.";
  }

  if (status === "in_transit") {
    return "The delivery man has picked up your order and is on the way.";
  }

  if (status === "delivered") {
    return "Your order has been delivered.";
  }

  if (status === "cancelled") {
    return "This delivery was cancelled.";
  }

  return "Tracking information is available.";
}

const createEmojiIcon = (emoji, background) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${background};
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 6px 16px rgba(0,0,0,0.25);
        font-size: 20px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

const shopIcon = createEmojiIcon("🏪", "#16a34a");
const homeIcon = createEmojiIcon("📍", "#2563eb");
const driverIcon = createEmojiIcon("🛵", "#facc15");

const getStatusBadgeStyle = (status) => ({
  display: "inline-block",
  padding: "8px 13px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
  background:
    status === "delivered"
      ? "#dcfce7"
      : status === "in_transit"
      ? "#dbeafe"
      : status === "going_to_shop"
      ? "#fef9c3"
      : status === "cancelled"
      ? "#fee2e2"
      : "#f3f4f6",
  color:
    status === "delivered"
      ? "#166534"
      : status === "in_transit"
      ? "#1d4ed8"
      : status === "going_to_shop"
      ? "#854d0e"
      : status === "cancelled"
      ? "#991b1b"
      : "#374151",
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

  deliveredOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  deliveredBox: {
    width: "min(420px, 92vw)",
    background: COLORS.white,
    borderRadius: 22,
    padding: 28,
    textAlign: "center",
    boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
    border: `1px solid ${COLORS.border}`,
  },

  deliveredIcon: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 36,
    margin: "0 auto 14px",
  },

  deliveredTitle: {
    margin: 0,
    color: COLORS.dark,
    fontSize: 28,
  },

  deliveredText: {
    color: COLORS.muted,
    fontWeight: 800,
    margin: "10px 0 0",
  },

  deliveredSmallText: {
    color: COLORS.muted,
    fontSize: 13,
    margin: "8px 0 20px",
  },

  deliveredButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 22,
    flexWrap: "wrap",
  },

  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: COLORS.primary,
  },

  title: {
    margin: 0,
    color: COLORS.dark,
    fontSize: "clamp(28px, 4vw, 38px)",
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
    fontWeight: 900,
    cursor: "pointer",
  },

  emptyCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: "50px 24px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  emptyIcon: {
    fontSize: 56,
  },

  emptyText: {
    color: COLORS.muted,
  },

  statusCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: "clamp(16px, 2.5vw, 22px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  statusLabel: {
    margin: 0,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  statusTitle: {
    margin: "6px 0",
    color: COLORS.dark,
  },

  statusText: {
    margin: 0,
    color: COLORS.muted,
    fontWeight: 700,
  },

  statusRight: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-end",
  },

  routeButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    gap: 14,
    marginBottom: 18,
  },

  infoCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 16,
    display: "grid",
    gap: 10,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    background: COLORS.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 25,
  },

  infoBody: {
    minWidth: 0,
  },

  infoTitle: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  infoName: {
    margin: "5px 0",
    color: COLORS.dark,
  },

  infoAddress: {
    margin: 0,
    color: COLORS.muted,
    overflowWrap: "anywhere",
    lineHeight: 1.5,
    fontWeight: 700,
  },

  coordinate: {
    margin: "7px 0 0",
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: 900,
  },

  smallRouteButton: {
    justifySelf: "start",
    background: COLORS.blue,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "10px 13px",
    fontWeight: 900,
  },

  mapCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: "clamp(16px, 2.5vw, 22px)",
    marginBottom: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  mapHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },

  mapTitle: {
    margin: 0,
    color: COLORS.dark,
  },

  mapText: {
    margin: "5px 0 0",
    color: COLORS.muted,
    fontWeight: 700,
  },

  refreshButton: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "10px 13px",
    fontWeight: 900,
    cursor: "pointer",
  },

  mapBox: {
    height: 430,
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  itemsCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: "clamp(16px, 2.5vw, 22px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  sectionTitle: {
    marginTop: 0,
    color: COLORS.dark,
  },

  itemsList: {
    display: "grid",
    gap: 12,
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 14,
    padding: 12,
    flexWrap: "wrap",
  },

  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    objectFit: "cover",
    background: "#f3f4f6",
  },

  itemInfo: {
    flex: 1,
    minWidth: 180,
  },

  itemText: {
    margin: "5px 0 0",
    color: COLORS.muted,
  },

  sizeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
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

  itemStatus: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 900,
  },
};

export default TrackDeliveryPage;