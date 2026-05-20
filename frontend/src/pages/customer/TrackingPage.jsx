import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { MapPin, Package, Truck } from "lucide-react";
import { roleThemes } from "../../theme/roleThemes";

const TrackingPage = () => {
  const theme = roleThemes.customer;
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={{ ...styles.kicker, color: theme.primary }}>Customer</p>
            <h1 style={styles.title}>Track Order #{id}</h1>
            <p style={styles.subtitle}>
              Live delivery tracking will appear here when the order is assigned
              to a delivery man.
            </p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/customer/orders")}>
            Back to Orders
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.timeline}>
            <Step
              icon={Package}
              title="Order Created"
              text="Your order was placed successfully."
              active
              theme={theme}
            />

            <Step
              icon={Truck}
              title="Delivery Assigned"
              text="A delivery man will be assigned by admin."
              active={false}
              theme={theme}
            />

            <Step
              icon={MapPin}
              title="Live Tracking"
              text="Current location will show after pickup."
              active={false}
              theme={theme}
            />
          </div>

          <div style={styles.mapBox}>
            <MapPin size={46} color={theme.primary} />
            <h2 style={styles.mapTitle}>Tracking Coming Soon</h2>
            <p style={styles.mapText}>
              This page is ready for the tracking API. When delivery location
              updates are connected, the map and driver location can be shown here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

function Step({ icon: Icon, title, text, active, theme }) {
  return (
    <div style={styles.step}>
      <div
        style={{
          ...styles.stepIcon,
          backgroundColor: active ? theme.primaryLight : "#f3f4f6",
          color: active ? theme.primaryDark : "#6b7280",
        }}
      >
        <Icon size={24} />
      </div>

      <div>
        <h3 style={styles.stepTitle}>{title}</h3>
        <p style={styles.stepText}>{text}</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
  },
  main: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
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
  backButton: {
    backgroundColor: "white",
    border: "1px solid #bbf7d0",
    borderRadius: 12,
    padding: "11px 16px",
    fontWeight: 900,
    color: "#166534",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "white",
    border: "1px solid #bbf7d0",
    borderRadius: 18,
    padding: "clamp(18px, 3vw, 26px)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
  },
  timeline: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 18,
    marginBottom: 24,
  },
  step: {
    display: "flex",
    gap: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #e5e7eb",
  },
  stepIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepTitle: {
    margin: 0,
    color: "#111827",
  },
  stepText: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },
  mapBox: {
    minHeight: 300,
    border: "1px dashed #86efac",
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    padding: 24,
    backgroundColor: "#f0fdf4",
  },
  mapTitle: {
    margin: "14px 0 8px",
    color: "#111827",
  },
  mapText: {
    maxWidth: 520,
    color: "#6b7280",
    lineHeight: 1.6,
  },
};

export default TrackingPage;