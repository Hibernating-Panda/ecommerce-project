import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "—";

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div>
            <div style={styles.badge}>Customer Account</div>
            <h1 style={styles.heroTitle}>
              Welcome back, {user?.name || "Customer"} 👋
            </h1>
            <p style={styles.heroText}>
              Manage your profile, view your orders, and continue shopping from
              your personal dashboard.
            </p>

            <div style={styles.heroActions}>
              <button style={styles.primaryButton} onClick={() => navigate("/home")}>
                Browse Store
              </button>

              <button style={styles.lightButton} onClick={() => navigate("/orders")}>
                View Orders
              </button>
            </div>
          </div>

          <div style={styles.heroIconBox}>
            <span style={styles.heroIcon}>🛍️</span>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <StatCard icon="📦" title="Orders" value="0" text="Total purchases" />
          <StatCard icon="❤️" title="Wishlist" value="0" text="Saved products" />
          <StatCard icon="🎟️" title="Coupons" value="0" text="Available deals" />
          <StatCard icon="⭐" title="Reviews" value="0" text="Your feedback" />
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Profile Information</h2>
                <p style={styles.cardSubtitle}>Your account details</p>
              </div>

              <button style={styles.smallButton} onClick={() => navigate("/profile")}>
                Edit
              </button>
            </div>

            <div style={styles.profileBox}>
              <div style={styles.avatar}>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 style={styles.profileName}>{user?.name || "Unknown User"}</h3>
                <p style={styles.profileEmail}>{user?.email || "No email"}</p>
              </div>
            </div>

            <div style={styles.infoList}>
              <InfoRow label="User ID" value={user?.id || "—"} />
              <InfoRow label="Email" value={user?.email || "—"} />
              <InfoRow label="Member Since" value={memberSince} />
              <InfoRow label="Account Status" value="Active" success />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Quick Actions</h2>
                <p style={styles.cardSubtitle}>Common things you can do</p>
              </div>
            </div>

            <div style={styles.actionList}>
              <ActionItem
                icon="🛒"
                title="Continue Shopping"
                text="Browse products from available shops."
                onClick={() => navigate("/home")}
              />

              <ActionItem
                icon="📦"
                title="My Orders"
                text="Track your order status and history."
                onClick={() => navigate("/orders")}
              />

              <ActionItem
                icon="👤"
                title="Edit Profile"
                text="Update your account information."
                onClick={() => navigate("/profile")}
              />

              <ActionItem
                icon="🔐"
                title="Security"
                text="Review login and account security."
                onClick={() => navigate("/settings")}
              />
            </div>
          </div>
        </section>

        <section style={styles.statusCard}>
          <div style={styles.statusIcon}>✅</div>

          <div>
            <h3 style={styles.statusTitle}>You are successfully logged in</h3>
            <p style={styles.statusText}>
              Your session is active. You can browse products, manage your
              account, and access protected customer features.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

function StatCard({ icon, title, value, text }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value}</h2>
        <p style={styles.statText}>{text}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, success }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span
        style={{
          ...styles.infoValue,
          color: success ? "#15803d" : COLORS.dark,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionItem({ icon, title, text, onClick }) {
  return (
    <button style={styles.actionItem} onClick={onClick}>
      <div style={styles.actionIcon}>{icon}</div>

      <div style={{ textAlign: "left" }}>
        <h3 style={styles.actionTitle}>{title}</h3>
        <p style={styles.actionText}>{text}</p>
      </div>

      <span style={styles.actionArrow}>→</span>
    </button>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(232,25,44,0.08), transparent 30%), #f4f6fb",
    color: COLORS.dark,
  },

  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "28px 20px 50px",
  },

  heroCard: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 55%, #E8192C 100%)",
    borderRadius: 24,
    padding: "34px 38px",
    color: COLORS.white,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    boxShadow: "0 20px 45px rgba(17,24,39,0.18)",
    marginBottom: 22,
    overflow: "hidden",
    position: "relative",
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  heroTitle: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "-0.8px",
  },

  heroText: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.78)",
    maxWidth: 560,
    lineHeight: 1.6,
    fontSize: 15,
  },

  heroActions: {
    display: "flex",
    gap: 12,
    marginTop: 22,
    flexWrap: "wrap",
  },

  primaryButton: {
    background: COLORS.white,
    color: COLORS.primary,
    border: "none",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
  },

  lightButton: {
    background: "rgba(255,255,255,0.12)",
    color: COLORS.white,
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "12px 20px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  heroIconBox: {
    width: 130,
    height: 130,
    borderRadius: 30,
    background: "rgba(255,255,255,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  heroIcon: {
    fontSize: 64,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 22,
  },

  statCard: {
    background: COLORS.white,
    borderRadius: 18,
    padding: 18,
    border: `1px solid ${COLORS.border}`,
    display: "flex",
    gap: 14,
    alignItems: "center",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#fff0f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },

  statTitle: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
  },

  statValue: {
    margin: "2px 0",
    fontSize: 24,
    fontWeight: 900,
    color: COLORS.dark,
  },

  statText: {
    margin: 0,
    color: COLORS.muted,
    fontSize: 12,
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 20,
    marginBottom: 22,
  },

  card: {
    background: COLORS.white,
    borderRadius: 20,
    padding: 22,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
    color: COLORS.dark,
  },

  cardSubtitle: {
    margin: "4px 0 0",
    color: COLORS.muted,
    fontSize: 13,
  },

  smallButton: {
    background: "#fff0f1",
    color: COLORS.primary,
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
  },

  profileBox: {
    background: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    background: COLORS.primary,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 900,
  },

  profileName: {
    margin: 0,
    fontSize: 18,
    color: COLORS.dark,
  },

  profileEmail: {
    margin: "4px 0 0",
    fontSize: 13,
    color: COLORS.muted,
  },

  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    borderBottom: "1px solid #f1f1f1",
    paddingBottom: 10,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },

  infoValue: {
    fontWeight: 800,
    fontSize: 14,
    textAlign: "right",
  },

  actionList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  actionItem: {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    background: "#fff",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "44px 1fr 24px",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
  },

  actionTitle: {
    margin: 0,
    fontSize: 15,
    color: COLORS.dark,
  },

  actionText: {
    margin: "4px 0 0",
    fontSize: 12,
    color: COLORS.muted,
  },

  actionArrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 900,
  },

  statusCard: {
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    borderRadius: 18,
    padding: 18,
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },

  statusTitle: {
    margin: 0,
    color: "#166534",
    fontSize: 17,
  },

  statusText: {
    margin: "5px 0 0",
    color: "#15803d",
    lineHeight: 1.5,
    fontSize: 14,
  },
};

export default DashboardPage;