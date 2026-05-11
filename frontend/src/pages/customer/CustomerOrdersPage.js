import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const CustomerOrdersPage = () => {
  const navigate = useNavigate();

  const orders = [];

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Orders</h1>
            <p style={styles.subtitle}>
              View your order history and track your purchases.
            </p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            text="When you buy products, your orders will appear here."
            buttonText="Start Shopping"
            onClick={() => navigate("/")}
          />
        ) : (
          <div style={styles.card}>
            {orders.map((order) => (
              <div key={order.id} style={styles.orderItem}>
                <div>
                  <h3 style={styles.itemTitle}>Order #{order.id}</h3>
                  <p style={styles.itemText}>{order.date}</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong>${order.total}</strong>
                  <p style={styles.status}>{order.status}</p>
                </div>
              </div>
            ))}
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
      <button style={styles.primaryButton} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
  },

  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 20px 50px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
  },

  title: {
    margin: 0,
    fontSize: 32,
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

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f1f1",
    padding: "16px 0",
  },

  itemTitle: {
    margin: 0,
    color: COLORS.dark,
  },

  itemText: {
    margin: "4px 0 0",
    color: COLORS.muted,
  },

  status: {
    margin: "4px 0 0",
    color: COLORS.primary,
    fontWeight: 800,
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

  primaryButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default CustomerOrdersPage;