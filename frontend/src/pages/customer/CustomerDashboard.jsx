import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import {
  Package,
  MapPin,
  Clock,
  ShoppingBag,
  User,
  Navigation,
} from "lucide-react";
import { roleThemes } from "../../theme/roleThemes";

const CustomerDashboard = () => {
  const theme = roleThemes.customer;
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, profileRes] = await Promise.all([
        api.get("/customer/orders"),
        api.get("/profile"),
      ]);

      setOrders(ordersRes.data.orders || ordersRes.data.data || []);

      const user = profileRes.data.user || profileRes.data;

      setProfile({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        latitude: user?.latitude || "",
        longitude: user?.longitude || "",
      });

      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Customer dashboard error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      inTransit: orders.filter((order) => order.status === "in_transit").length,
      delivered: orders.filter((order) =>
        ["delivered", "completed"].includes(order.status)
      ).length,
    };
  }, [orders]);

  const recentOrders = orders.slice(0, 5);

  const hasLocation = Boolean(profile.latitude && profile.longitude);

  const openLocationInMap = () => {
    if (!hasLocation) return;

    const lat = Number(profile.latitude);
    const lng = Number(profile.longitude);

    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={{ ...styles.kicker, color: theme.primary }}>Customer</p>
            <h1 style={styles.title}>My Dashboard</h1>
            <p style={styles.subtitle}>
              View your orders, saved location, checkout status, and delivery
              progress.
            </p>
          </div>

          <button
            style={{ ...styles.primaryButton, backgroundColor: theme.primary }}
            onClick={() => navigate("/")}
          >
            Start Shopping
          </button>
        </div>

        {message && <div style={styles.errorBox}>{message}</div>}

        <div style={styles.statsGrid}>
          <StatCard
            icon={Package}
            title="Total Orders"
            value={stats.total}
            theme={theme}
          />

          <StatCard
            icon={MapPin}
            title="In Transit"
            value={stats.inTransit}
            theme={theme}
          />

          <StatCard
            icon={Clock}
            title="Delivered"
            value={stats.delivered}
            theme={theme}
          />
        </div>

        <section style={styles.locationCard}>
          <div style={styles.locationHeader}>
            <div
              style={{
                ...styles.locationIconBox,
                backgroundColor: theme.primaryLight,
              }}
            >
              <MapPin size={26} style={{ color: theme.primaryDark }} />
            </div>

            <div>
              <h2 style={styles.locationTitle}>Saved Delivery Location</h2>
              <p style={styles.locationSubtitle}>
                This location is used as your default delivery address.
              </p>
            </div>
          </div>

          <div style={styles.locationBody}>
            <div>
              <p style={styles.locationLabel}>Address</p>
              <p style={styles.locationValue}>
                {profile.address || "No address saved yet."}
              </p>
            </div>

            <div>
              <p style={styles.locationLabel}>Map Location</p>

              {hasLocation ? (
                <p style={styles.locationValue}>
                  {Number(profile.latitude).toFixed(6)},{" "}
                  {Number(profile.longitude).toFixed(6)}
                </p>
              ) : (
                <p style={styles.locationValue}>No map location selected.</p>
              )}
            </div>
          </div>

          <div style={styles.locationActions}>
            <button
              type="button"
              style={{
                ...styles.locationButton,
                backgroundColor: theme.primary,
              }}
              onClick={() => navigate("/customer/profile")}
            >
              <User size={17} />
              Edit Profile Location
            </button>

            <button
              type="button"
              style={{
                ...styles.mapOpenButton,
                opacity: hasLocation ? 1 : 0.55,
                cursor: hasLocation ? "pointer" : "not-allowed",
              }}
              disabled={!hasLocation}
              onClick={openLocationInMap}
            >
              <Navigation size={17} />
              Open Map
            </button>
          </div>
        </section>

        <div style={styles.actionGrid}>
          <button style={styles.actionCard} onClick={() => navigate("/")}>
            <ShoppingBag style={{ ...styles.actionIcon, color: theme.primary }} />
            <p style={styles.actionTitle}>Shop Products</p>
            <p style={styles.actionText}>Browse products and add to cart</p>
          </button>

          <button
            style={styles.actionCard}
            onClick={() => navigate("/customer/orders")}
          >
            <Package style={{ ...styles.actionIcon, color: theme.primary }} />
            <p style={styles.actionTitle}>My Orders</p>
            <p style={styles.actionText}>Checkout, cancel, and view orders</p>
          </button>
        </div>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Orders</h2>
              <p style={styles.sectionSubtitle}>
                Latest orders from your account.
              </p>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate("/customer/orders")}
            >
              View All
            </button>
          </div>

          {loading ? (
            <p style={styles.emptyText}>Loading orders...</p>
          ) : recentOrders.length === 0 ? (
            <p style={styles.emptyText}>No orders yet.</p>
          ) : (
            <div style={styles.orderList}>
              {recentOrders.map((order) => (
                <div key={order.id} style={styles.orderItem}>
                  <div>
                    <p style={styles.orderTitle}>Order #{order.id}</p>
                    <p style={styles.orderDate}>
                      {order.order_date
                        ? new Date(order.order_date).toLocaleString()
                        : order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : "No date"}
                    </p>
                  </div>

                  <div style={styles.orderRight}>
                    <p style={styles.total}>
                      ${Number(order.total || getOrderTotal(order)).toFixed(2)}
                    </p>
                    <span style={getStatusStyle(order.status)}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

function StatCard({ icon: Icon, title, value, theme }) {
  return (
    <div style={{ ...styles.statCard, borderColor: theme.border }}>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={{ ...styles.statValue, color: theme.primaryDark }}>
          {value}
        </h3>
      </div>

      <div style={{ ...styles.statIconBox, backgroundColor: theme.primaryLight }}>
        <Icon style={{ color: theme.primaryDark }} size={26} />
      </div>
    </div>
  );
}

const getOrderTotal = (order) => {
  return (order.items || [])
    .filter((item) => item.status !== "rejected")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  };

  if (["delivered", "completed", "ready_for_delivery"].includes(status)) {
    return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
  }

  if (status === "in_transit") {
    return { ...base, backgroundColor: "#dbeafe", color: "#1d4ed8" };
  }

  if (status === "cancelled" || status === "partially_rejected") {
    return { ...base, backgroundColor: "#fee2e2", color: "#991b1b" };
  }

  return { ...base, backgroundColor: "#fef9c3", color: "#854d0e" };
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
  },

  main: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 24,
  },

  kicker: {
    margin: "0 0 6px",
    fontSize: 13,
    fontWeight: 900,
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

  primaryButton: {
    border: "none",
    color: "white",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    color: "#374151",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fecaca",
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 800,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 18,
    marginBottom: 24,
  },

  statCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bbf7d0",
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },

  statTitle: {
    margin: 0,
    color: "#6b7280",
    fontWeight: 800,
  },

  statValue: {
    margin: "10px 0 0",
    fontSize: 34,
  },

  statIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  locationCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
    marginBottom: 24,
  },

  locationHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },

  locationIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  locationTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
  },

  locationSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },

  locationBody: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 16,
    marginBottom: 18,
  },

  locationLabel: {
    margin: "0 0 6px",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  locationValue: {
    margin: 0,
    color: "#111827",
    fontWeight: 800,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  locationActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  locationButton: {
    border: "none",
    color: "white",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  mapOpenButton: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "none",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 18,
    marginBottom: 24,
  },

  actionCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 22,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
  },

  actionIcon: {
    marginBottom: 10,
  },

  actionTitle: {
    margin: 0,
    fontWeight: 900,
    color: "#111827",
    fontSize: 18,
  },

  actionText: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  orderList: {
    display: "grid",
    gap: 12,
  },

  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: 14,
    flexWrap: "wrap",
  },

  orderTitle: {
    margin: 0,
    fontWeight: 900,
    color: "#111827",
  },

  orderDate: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },

  orderRight: {
    textAlign: "right",
  },

  total: {
    margin: "0 0 6px",
    color: "#166534",
    fontWeight: 900,
  },

  emptyText: {
    color: "#6b7280",
    fontWeight: 700,
    textAlign: "center",
    padding: 20,
  },
};

export default CustomerDashboard;