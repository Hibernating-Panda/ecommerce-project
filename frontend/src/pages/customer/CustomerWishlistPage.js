import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API_URL, authHeaders } from "../../services/api";
import { useEffect, useState } from "react";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};



const CustomerWishlistPage = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const res = await fetch(`${API_URL}/wishlist`, {
      headers: authHeaders(),
    });

    const data = await res.json();
    setWishlist(data.wishlist || []);
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Wishlist</h1>
            <p style={styles.subtitle}>
              Products you saved for later will appear here.
            </p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/customer/dashboard")}>
            Back to Dashboard
          </button>
        </div>

        {wishlist.length === 0 ? (
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
                <img
                  src={
                    item.product?.image_url ||
                    item.product?.thumbnail ||
                    item.product?.image ||
                    "https://via.placeholder.com/300"
                  }
                  alt={item.product?.name}
                  style={styles.image}
                />

                <h3>{item.product?.name}</h3>
                <p>${Number(item.product?.price || 0).toFixed(2)}</p>

                <button onClick={() => navigate(`/products/${item.product?.id}`)}>
                  View Product
                </button>
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 18,
  },

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  imageBox: {
    height: 180,
    borderRadius: 14,
    background: "#f9fafb",
    overflow: "hidden",
    marginBottom: 12,
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  productName: {
    margin: 0,
    color: COLORS.dark,
  },

  price: {
    color: COLORS.primary,
    fontWeight: 900,
    margin: "8px 0 14px",
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