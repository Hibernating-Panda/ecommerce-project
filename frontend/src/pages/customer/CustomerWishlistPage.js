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

const CustomerWishlistPage = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2800);
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/wishlist`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load wishlist.");
      }

      setWishlist(data.wishlist?.data || data.wishlist || []);
    } catch (error) {
      showMessage(error.message || "Failed to load wishlist.");
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
            <h1 style={styles.title}>My Wishlist</h1>
            <p style={styles.subtitle}>
              Products you saved for later will appear here.
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

        {loading ? (
          <div style={styles.loadingCard}>Loading wishlist...</div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            text="Save products you like so you can find them again easily."
            buttonText="Browse Products"
            onClick={() => navigate("/")}
          />
        ) : (
          <div style={styles.grid}>
            {wishlist.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.imageBox}>
                  <img
                    src={
                      item.product?.image_url ||
                      item.product?.thumbnail ||
                      item.product?.image ||
                      "https://via.placeholder.com/300"
                    }
                    alt={item.product?.name || "Product"}
                    style={styles.image}
                  />
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>
                    {item.product?.name || "Product"}
                  </h3>

                  <p style={styles.shopName}>
                    {item.product?.shop?.shop_name || "Unknown Shop"}
                  </p>

                  <p style={styles.price}>
                    ${Number(item.product?.price || 0).toFixed(2)}
                  </p>

                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={() => navigate(`/products/${item.product?.id}`)}
                    disabled={!item.product?.id}
                  >
                    View Product
                  </button>
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
      <button type="button" style={styles.primaryButton} onClick={onClick}>
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
    width: "100%",
    maxWidth: 1100,
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
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  loadingCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 24,
    color: COLORS.muted,
    textAlign: "center",
    fontWeight: 700,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))",
    gap: 18,
  },
  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  imageBox: {
    height: 190,
    background: "#f9fafb",
    overflow: "hidden",
    borderBottom: `1px solid ${COLORS.softBorder}`,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBody: {
    padding: 16,
  },
  productName: {
    margin: 0,
    color: COLORS.dark,
    fontSize: 18,
  },
  shopName: {
    margin: "6px 0 0",
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
  },
  price: {
    color: COLORS.primaryDark,
    fontWeight: 900,
    margin: "10px 0 14px",
    fontSize: 18,
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

export default CustomerWishlistPage;