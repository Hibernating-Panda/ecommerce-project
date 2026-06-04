import React from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  primary: "#facc15",
  primaryDark: "#854d0e",
  primaryLight: "#fef9c3",
  dark: "#111827",
  muted: "#6b7280",
  border: "#fde68a",
  white: "#ffffff",
  green: "#16a34a",
  blue: "#2563eb",
};

function DeliveryHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.kicker}>Today’s Delivery Work</p>
          <h2 style={styles.title}>Start your route from the jobs board.</h2>
          <p style={styles.text}>
            Accept available delivery jobs, go to the shop, pick up the package,
            and complete the customer drop-off.
          </p>
        </div>

        <button
          type="button"
          style={styles.mainButton}
          onClick={() => navigate("/delivery/orders")}
        >
          Open Delivery Jobs
        </button>
      </section>

      <section style={styles.flowGrid}>
        <div style={styles.flowCard}>
          <div style={styles.icon}>📦</div>
          <h3>1. Accept Job</h3>
          <p>Choose an available delivery task from the jobs board.</p>
        </div>

        <div style={styles.flowCard}>
          <div style={styles.icon}>🏪</div>
          <h3>2. Go to Shop</h3>
          <p>Use the shop map and pick up the customer’s package.</p>
        </div>

        <div style={styles.flowCard}>
          <div style={styles.icon}>📍</div>
          <h3>3. Drop Off</h3>
          <p>Deliver to the customer location and mark the trip delivered.</p>
        </div>
      </section>

      <section style={styles.actionGrid}>
        <button
          type="button"
          style={styles.actionCard}
          onClick={() => navigate("/delivery/orders")}
        >
          <span style={styles.actionIcon}>🛵</span>
          <div>
            <strong>Delivery Jobs</strong>
            <p>View open jobs and active trips.</p>
          </div>
        </button>

        <button
          type="button"
          style={styles.actionCard}
          onClick={() => navigate("/delivery/history")}
        >
          <span style={styles.actionIcon}>🧾</span>
          <div>
            <strong>Trip History</strong>
            <p>Review completed deliveries.</p>
          </div>
        </button>

        <button
          type="button"
          style={styles.actionCard}
          onClick={() => navigate("/delivery/profile")}
        >
          <span style={styles.actionIcon}>👤</span>
          <div>
            <strong>Courier Profile</strong>
            <p>Manage your delivery profile.</p>
          </div>
        </button>
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: 22,
  },

  hero: {
    background: "linear-gradient(135deg, #111827, #374151)",
    color: COLORS.white,
    borderRadius: 22,
    padding: "clamp(22px, 4vw, 34px)",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 16px 35px rgba(15,23,42,0.16)",
  },

  kicker: {
    margin: "0 0 8px",
    color: COLORS.primary,
    fontWeight: 900,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: 0,
    fontSize: "clamp(26px, 5vw, 42px)",
    maxWidth: 620,
  },

  text: {
    margin: "10px 0 0",
    color: "#e5e7eb",
    lineHeight: 1.7,
    maxWidth: 620,
  },

  mainButton: {
    background: COLORS.primary,
    color: COLORS.dark,
    border: "none",
    borderRadius: 14,
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
  },

  flowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: 16,
  },

  flowCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    marginBottom: 12,
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 16,
  },

  actionCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 18,
    display: "flex",
    gap: 14,
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: COLORS.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    flexShrink: 0,
  },
};

export default DeliveryHome;