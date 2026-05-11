import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API_URL, authHeaders } from "../../services/api";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load cart");
      }

      setCartItems(data.cart_items || []);
    } catch (error) {
      showMessage(error.message || "Failed to load cart");
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update quantity");
      }

      fetchCart();
    } catch (error) {
      showMessage(error.message || "Failed to update quantity");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      showMessage("Item removed from cart.");
      fetchCart();
    } catch (error) {
      showMessage(error.message || "Failed to remove item");
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + Number(item.product?.price || 0) * Number(item.quantity || 1);
  }, 0);

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Cart</h1>
            <p style={styles.subtitle}>Review products before checkout.</p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p style={styles.emptyText}>Add products to cart first.</p>
            <button style={styles.primaryButton} onClick={() => navigate("/")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <img
                    src={
                      item.product?.image_url ||
                      item.product?.thumbnail ||
                      item.product?.image ||
                      "https://via.placeholder.com/100"
                    }
                    alt={item.product?.name}
                    style={styles.image}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={styles.productName}>{item.product?.name}</h3>
                    <p style={styles.price}>
                      ${Number(item.product?.price || 0).toFixed(2)}
                    </p>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                    style={styles.qtyInput}
                  />

                  <button style={styles.removeButton} onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Total</span>
                <strong style={styles.total}>${total.toFixed(2)}</strong>
              </div>

              <button style={styles.primaryButton} onClick={() => navigate("/checkout")}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

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

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 22,
  },

  title: {
    margin: 0,
    color: COLORS.dark,
    fontSize: 32,
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
    gridTemplateColumns: "1fr 320px",
    gap: 22,
  },

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: 20,
  },

  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderBottom: "1px solid #f1f1f1",
    padding: "14px 0",
  },

  image: {
    width: 86,
    height: 86,
    objectFit: "cover",
    borderRadius: 14,
    background: "#f9fafb",
  },

  productName: {
    margin: 0,
    color: COLORS.dark,
  },

  price: {
    margin: "5px 0 0",
    color: COLORS.primary,
    fontWeight: 900,
  },

  qtyInput: {
    width: 70,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: 9,
  },

  removeButton: {
    background: "#fff0f1",
    color: COLORS.primary,
    border: "none",
    borderRadius: 10,
    padding: "9px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },

  summaryCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: 20,
    height: "fit-content",
  },

  summaryTitle: {
    marginTop: 0,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
    color: COLORS.dark,
  },

  total: {
    color: COLORS.primary,
    fontSize: 22,
  },

  emptyCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 22,
    padding: "50px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 56,
  },

  emptyText: {
    color: COLORS.muted,
  },

  primaryButton: {
    width: "100%",
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
};

export default CartPage;