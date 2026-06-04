import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";

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
  purple: "#7c3aed",
};

function DeliveryOrders() {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [autoTracking, setAutoTracking] = useState(true);
  const [lastSharedAt, setLastSharedAt] = useState(null);

  const activeTripsRef = useRef([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    activeTripsRef.current = activeTrips;
  }, [activeTrips]);

  useEffect(() => {
    if (!autoTracking) return;

    const interval = setInterval(() => {
      const shareableTrips = activeTripsRef.current.filter((delivery) =>
        ["going_to_shop", "in_transit"].includes(delivery.status)
      );

      shareableTrips.forEach((delivery) => {
        shareDriverLocation(delivery.id, true);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoTracking]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchTrips = async () => {
    setLoading(true);

    try {
      const [availableRes, activeRes] = await Promise.all([
        api.get("/delivery/available"),
        api.get("/delivery/orders"),
      ]);

      setAvailableJobs(availableRes.data.data || availableRes.data || []);
      setActiveTrips(activeRes.data.data || activeRes.data || []);
    } catch (error) {
      console.error("Fetch delivery jobs error:", error);
      showMessage(error.response?.data?.message || "Failed to load delivery jobs.");
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (deliveryId) => {
    try {
      const res = await api.put(`/delivery/orders/${deliveryId}/accept`);

      showMessage(res.data.message || "Delivery job accepted.");
      fetchTrips();
    } catch (error) {
      console.error("Accept job error:", error);
      showMessage(error.response?.data?.message || "Failed to accept job.");
    }
  };

  const updateTripStatus = async (deliveryId, status) => {
    try {
      const res = await api.put(`/delivery/orders/${deliveryId}/status`, {
        status,
      });

      showMessage(res.data.message || "Trip updated.");
      fetchTrips();
    } catch (error) {
      console.error("Update trip error:", error);
      showMessage(error.response?.data?.message || "Failed to update trip.");
    }
  };

  const shareDriverLocation = async (deliveryId, silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) showMessage("GPS is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.put(`/delivery/orders/${deliveryId}/location`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setLastSharedAt(new Date());

          if (!silent) {
            showMessage("Location shared with customer.");
            fetchTrips();
          }
        } catch (error) {
          console.error("Share location error:", error);

          if (!silent) {
            showMessage(
              error.response?.data?.message || "Failed to share location."
            );
          }
        }
      },
      () => {
        if (!silent) {
          showMessage("Please allow location permission to share GPS.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const openMap = (lat, lng) => {
    if (!lat || !lng) {
      showMessage("No map location available.");
      return;
    }

    const destination = `${lat},${lng}`;

    if (!navigator.geolocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;

        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      () => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  if (loading) {
    return <div style={styles.loadingBox}>Loading delivery jobs...</div>;
  }

  return (
    <div style={styles.page}>
      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.heroPanel}>
        <div>
          <p style={styles.kicker}>Courier Task Board</p>
          <h2 style={styles.heroTitle}>Find a job, pick up, and deliver.</h2>
          <p style={styles.heroText}>
            Available jobs are new delivery tasks. Active trips are jobs you have accepted.
          </p>

          <p style={styles.trackingText}>
            Auto location sharing:{" "}
            <strong>{autoTracking ? "ON" : "OFF"}</strong>
            {lastSharedAt && (
              <>
                {" "}
                · Last shared:{" "}
                <strong>{lastSharedAt.toLocaleTimeString()}</strong>
              </>
            )}
          </p>
        </div>

        <div style={styles.heroActions}>
          <button
            type="button"
            style={autoTracking ? styles.autoOnBtn : styles.autoOffBtn}
            onClick={() => setAutoTracking((prev) => !prev)}
          >
            {autoTracking ? "Auto Tracking On" : "Auto Tracking Off"}
          </button>

          <button type="button" style={styles.refreshBtn} onClick={fetchTrips}>
            Refresh Jobs
          </button>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionTop}>
          <div>
            <h2 style={styles.sectionTitle}>Available Jobs</h2>
            <p style={styles.sectionText}>Accept one job to start a delivery trip.</p>
          </div>

          <span style={styles.countBadge}>{availableJobs.length} open</span>
        </div>

        {availableJobs.length === 0 ? (
          <EmptyBox
            icon="📭"
            title="No open jobs"
            text="New delivery jobs will appear here when shops mark orders ready."
          />
        ) : (
          <div style={styles.jobGrid}>
            {availableJobs.map((delivery) => (
              <JobCard
                key={delivery.id}
                delivery={delivery}
                onOpenMap={openMap}
                onAccept={acceptJob}
              />
            ))}
          </div>
        )}
      </section>

      <section style={styles.section}>
        <div style={styles.sectionTop}>
          <div>
            <h2 style={styles.sectionTitle}>Active Trips</h2>
            <p style={styles.sectionText}>
              Continue your accepted deliveries. Location is shared automatically while active.
            </p>
          </div>

          <span style={styles.countBadge}>{activeTrips.length} active</span>
        </div>

        {activeTrips.length === 0 ? (
          <EmptyBox
            icon="🛵"
            title="No active trips"
            text="Accepted jobs will move here."
          />
        ) : (
          <div style={styles.tripGrid}>
            {activeTrips.map((delivery) => (
              <TripCard
                key={delivery.id}
                delivery={delivery}
                onOpenMap={openMap}
                onUpdateStatus={updateTripStatus}
                onShareLocation={shareDriverLocation}
                autoTracking={autoTracking}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JobCard({ delivery, onOpenMap, onAccept }) {
  const items = delivery.order_items || delivery.orderItems || [];

  return (
    <article style={styles.jobCard}>
      <div style={styles.jobTop}>
        <div>
          <p style={styles.cardKicker}>Job #{delivery.id}</p>
          <h3 style={styles.cardTitle}>Order #{delivery.order_id}</h3>
        </div>

        <span style={statusStyle(delivery.status)}>
          {getStatusLabel(delivery.status)}
        </span>
      </div>

      <RouteLine
        pickupTitle={delivery.shop?.shop_name || "Shop"}
        pickupAddress={delivery.pickup_location}
        dropTitle={delivery.order?.customer?.name || delivery.order?.customer_name || "Customer"}
        dropAddress={delivery.delivery_location}
      />

      <div style={styles.quickInfoGrid}>
        <InfoPill label="Customer Phone" value={delivery.order?.customer?.phone || "No phone"} />
        <InfoPill label="Shop Phone" value={delivery.shop?.phone || "No phone"} />
      </div>

      <ItemList items={items} />

      <div style={styles.mapRow}>
        <button
          type="button"
          style={styles.mapBtn}
          onClick={() => onOpenMap(delivery.pickup_lat, delivery.pickup_lng)}
        >
          Shop Map
        </button>

        <button
          type="button"
          style={styles.mapBtn}
          onClick={() => onOpenMap(delivery.delivery_lat, delivery.delivery_lng)}
        >
          Customer Map
        </button>
      </div>

      <button
        type="button"
        style={styles.acceptJobBtn}
        onClick={() => onAccept(delivery.id)}
      >
        Accept Delivery Job
      </button>
    </article>
  );
}

function TripCard({
  delivery,
  onOpenMap,
  onUpdateStatus,
  onShareLocation,
  autoTracking,
}) {
  const items = delivery.order_items || delivery.orderItems || [];
  const isGoingToShop = delivery.status === "going_to_shop";

  const currentTarget = isGoingToShop
    ? {
        label: "Current Target",
        title: "Go to shop for pickup",
        address: delivery.pickup_location,
        lat: delivery.pickup_lat,
        lng: delivery.pickup_lng,
        icon: "🏪",
      }
    : {
        label: "Current Target",
        title: "Deliver to customer",
        address: delivery.delivery_location,
        lat: delivery.delivery_lat,
        lng: delivery.delivery_lng,
        icon: "📍",
      };

  return (
    <article style={styles.tripCard}>
      <div style={styles.tripHeader}>
        <div>
          <p style={styles.cardKicker}>Trip #{delivery.id}</p>
          <h3 style={styles.cardTitle}>
            {isGoingToShop ? "Heading to shop" : "On the way to customer"}
          </h3>
          <p style={styles.autoSmallText}>
            {autoTracking
              ? "Auto GPS sharing is running every 5 seconds."
              : "Auto GPS sharing is off."}
          </p>
        </div>

        <span style={statusStyle(delivery.status)}>
          {getStatusLabel(delivery.status)}
        </span>
      </div>

      <div style={styles.targetPanel}>
        <div style={styles.targetIcon}>{currentTarget.icon}</div>

        <div style={styles.targetInfo}>
          <span style={styles.targetLabel}>{currentTarget.label}</span>
          <strong style={styles.targetTitle}>{currentTarget.title}</strong>
          <p style={styles.targetAddress}>{currentTarget.address || "No address"}</p>
        </div>

        <button
          type="button"
          style={styles.targetMapBtn}
          onClick={() => onOpenMap(currentTarget.lat, currentTarget.lng)}
        >
          Open Route
        </button>
      </div>

      <RouteLine
        pickupTitle={delivery.shop?.shop_name || "Shop"}
        pickupAddress={delivery.pickup_location}
        dropTitle={delivery.order?.customer?.name || delivery.order?.customer_name || "Customer"}
        dropAddress={delivery.delivery_location}
      />

      <ItemList items={items} />

      <div style={styles.tripActions}>
        <button
          type="button"
          style={styles.shareLocationBtn}
          onClick={() => onShareLocation(delivery.id, false)}
        >
          Share My Location Now
        </button>

        {delivery.status === "going_to_shop" && (
          <button
            type="button"
            style={styles.pickupBtn}
            onClick={() => onUpdateStatus(delivery.id, "picked_up")}
          >
            I Picked Up The Order
          </button>
        )}

        {delivery.status === "in_transit" && (
          <button
            type="button"
            style={styles.deliveredBtn}
            onClick={() => onUpdateStatus(delivery.id, "delivered")}
          >
            Mark Delivered
          </button>
        )}
      </div>
    </article>
  );
}

function RouteLine({ pickupTitle, pickupAddress, dropTitle, dropAddress }) {
  return (
    <div style={styles.routeBox}>
      <div style={styles.routePoint}>
        <div style={styles.routeIcon}>🏪</div>
        <div>
          <span style={styles.routeLabel}>Pickup</span>
          <strong style={styles.routeTitle}>{pickupTitle}</strong>
          <p style={styles.routeAddress}>{pickupAddress || "No pickup address"}</p>
        </div>
      </div>

      <div style={styles.routeConnector} />

      <div style={styles.routePoint}>
        <div style={styles.routeIcon}>📍</div>
        <div>
          <span style={styles.routeLabel}>Drop-off</span>
          <strong style={styles.routeTitle}>{dropTitle}</strong>
          <p style={styles.routeAddress}>{dropAddress || "No delivery address"}</p>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={styles.infoPill}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ItemList({ items }) {
  return (
    <div style={styles.itemsBox}>
      <span style={styles.itemsLabel}>Package Items</span>

      {items.length === 0 ? (
        <p style={styles.emptyItems}>No items</p>
      ) : (
        <div style={styles.itemsList}>
          {items.map((item) => {
            const size = getOrderItemSize(item);

            return (
              <div key={item.id} style={styles.itemLine}>
                <strong>{item.product?.name || "Product"}</strong>
                {size && <span style={styles.sizeChip}>{size}</span>}
                <span>× {item.quantity || 1}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyBox({ icon, title, text }) {
  return (
    <div style={styles.emptyBox}>
      <div style={styles.emptyIcon}>{icon}</div>
      <h3 style={styles.emptyTitle}>{title}</h3>
      <p style={styles.emptyText}>{text}</p>
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

const getStatusLabel = (status) => {
  if (status === "available") return "Available";
  if (status === "going_to_shop") return "Going To Shop";
  if (status === "in_transit") return "Delivering";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";

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
    display: "inline-block",
    whiteSpace: "nowrap",
  };

  if (status === "delivered") {
    return { ...base, background: "#dcfce7", color: "#15803d" };
  }

  if (status === "in_transit") {
    return { ...base, background: "#dbeafe", color: "#1d4ed8" };
  }

  if (status === "going_to_shop") {
    return { ...base, background: "#ede9fe", color: "#6d28d9" };
  }

  if (status === "cancelled") {
    return { ...base, background: "#fee2e2", color: "#b91c1c" };
  }

  return { ...base, background: COLORS.primaryLight, color: COLORS.primaryDark };
};

const styles = {
  page: {
    display: "grid",
    gap: 22,
  },

  loadingBox: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 24,
    color: COLORS.muted,
    fontWeight: 900,
    textAlign: "center",
  },

  message: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
  },

  heroPanel: {
    background: "linear-gradient(135deg, #111827, #374151)",
    color: COLORS.white,
    borderRadius: 20,
    padding: "clamp(18px, 3vw, 26px)",
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
    flexWrap: "wrap",
    boxShadow: "0 16px 35px rgba(15,23,42,0.16)",
  },

  heroActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  kicker: {
    margin: "0 0 8px",
    color: COLORS.primary,
    fontWeight: 900,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(24px, 4vw, 34px)",
  },

  heroText: {
    margin: "8px 0 0",
    color: "#e5e7eb",
    lineHeight: 1.6,
  },

  trackingText: {
    margin: "10px 0 0",
    color: "#fef9c3",
    fontWeight: 800,
  },

  refreshBtn: {
    background: COLORS.primary,
    color: COLORS.dark,
    border: "none",
    borderRadius: 12,
    padding: "11px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  autoOnBtn: {
    background: "#16a34a",
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "11px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  autoOffBtn: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: 12,
    padding: "11px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  section: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: "clamp(16px, 2.5vw, 22px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    color: COLORS.dark,
  },

  sectionText: {
    margin: "5px 0 0",
    color: COLORS.muted,
    fontWeight: 700,
  },

  countBadge: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 999,
    padding: "7px 12px",
    fontWeight: 900,
    fontSize: 13,
  },

  jobGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
    gap: 16,
  },

  tripGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 430px), 1fr))",
    gap: 16,
  },

  jobCard: {
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 18,
    padding: 16,
    background: "#ffffff",
    display: "grid",
    gap: 14,
    boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
  },

  tripCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 16,
    background: "#fffbeb",
    display: "grid",
    gap: 14,
    boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
  },

  jobTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  tripHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  cardKicker: {
    margin: "0 0 5px",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  cardTitle: {
    margin: 0,
    color: COLORS.dark,
    fontSize: 21,
  },

  autoSmallText: {
    margin: "6px 0 0",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 800,
  },

  routeBox: {
    display: "grid",
    gap: 8,
    background: "#f9fafb",
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 14,
    padding: 12,
  },

  routePoint: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },

  routeIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: COLORS.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  routeConnector: {
    width: 2,
    height: 18,
    background: COLORS.border,
    marginLeft: 16,
  },

  routeLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  routeTitle: {
    color: COLORS.dark,
  },

  routeAddress: {
    margin: "4px 0 0",
    color: "#374151",
    overflowWrap: "anywhere",
    lineHeight: 1.5,
  },

  quickInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
  },

  infoPill: {
    background: COLORS.primaryLight,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 10,
    display: "grid",
    gap: 4,
  },

  itemsBox: {
    background: "#f9fafb",
    border: `1px solid ${COLORS.softBorder}`,
    borderRadius: 14,
    padding: 12,
  },

  itemsLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  emptyItems: {
    margin: 0,
    color: COLORS.muted,
    fontWeight: 700,
  },

  itemsList: {
    display: "grid",
    gap: 7,
  },

  itemLine: {
    background: COLORS.white,
    border: `1px solid ${COLORS.softBorder}`,
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },

  sizeChip: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 900,
  },

  mapRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  mapBtn: {
    background: COLORS.blue,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "9px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },

  acceptJobBtn: {
    background: COLORS.primary,
    color: COLORS.dark,
    border: "none",
    borderRadius: 14,
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  },

  targetPanel: {
    background: "#111827",
    color: COLORS.white,
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gap: 12,
    alignItems: "center",
  },

  targetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: COLORS.primary,
    color: COLORS.dark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },

  targetInfo: {
    minWidth: 0,
  },

  targetLabel: {
    display: "block",
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  targetTitle: {
    display: "block",
    color: COLORS.white,
    marginTop: 3,
  },

  targetAddress: {
    margin: "4px 0 0",
    color: "#d1d5db",
    overflowWrap: "anywhere",
  },

  targetMapBtn: {
    background: COLORS.primary,
    color: COLORS.dark,
    border: "none",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  tripActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  pickupBtn: {
    background: COLORS.blue,
    color: COLORS.white,
    border: "none",
    borderRadius: 14,
    padding: "12px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  deliveredBtn: {
    background: COLORS.green,
    color: COLORS.white,
    border: "none",
    borderRadius: 14,
    padding: "12px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  shareLocationBtn: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: 14,
    padding: "12px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  emptyBox: {
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 18,
    padding: "34px 18px",
    textAlign: "center",
    background: "#fffdf4",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 8,
  },

  emptyTitle: {
    margin: 0,
    color: COLORS.dark,
  },

  emptyText: {
    color: COLORS.muted,
    fontWeight: 700,
    margin: "8px 0 0",
  },
};

export default DeliveryOrders;