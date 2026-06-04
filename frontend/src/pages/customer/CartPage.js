import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
  green: "#16a34a",
  greenDark: "#166534",
  greenLight: "#dcfce7",
};

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchCart(true);
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchCart = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setLoading(true);
      }

      const res = await api.get("/cart");
      setCartItems(res.data.cart_items || res.data.data || []);
    } catch (error) {
      console.error("Fetch cart error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to load cart.");
    } finally {
      if (showFullLoading) {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const cleanQuantity = Math.max(1, Number(quantity || 1));

    try {
      await api.put(`/cart/${cartItemId}`, {
        quantity: cleanQuantity,
      });

      fetchCart();
    } catch (error) {
      console.error("Update quantity error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to update quantity.");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);

      showMessage("Item removed from cart.");
      fetchCart();
    } catch (error) {
      console.error("Remove cart item error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to remove item.");
    }
  };

  const placeOrder = async () => {
    try {
      setOrdering(true);

      const res = await api.post("/orders", {});

      showMessage(res.data.message || "Order placed successfully.");
      navigate("/customer/orders");
    } catch (error) {
      console.error("Place order error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to place order.");
    } finally {
      setOrdering(false);
    }
  };

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + getCartItemFinalPrice(item) * Number(item.quantity || 1);
    }, 0);
  }, [cartItems]);

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Cart</h1>
            <p style={styles.subtitle}>Review products before ordering.</p>
          </div>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🛒</div>
            <h2>Loading cart...</h2>
            <p style={styles.emptyText}>
              Please wait while we load your products.
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p style={styles.emptyText}>Add products to cart first.</p>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("/")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card}>
              {cartItems.map((item) => {
                const product = item.product || {};
                const imageUrl = getProductImage(product);
                const size = getCartItemSize(item);

                const basePrice = getCartItemBasePrice(item);
                const finalPrice = getCartItemFinalPrice(item);
                const hasDiscount = finalPrice < basePrice;
                const discountPercent = getDiscountPercent(item);

                const itemTotal = finalPrice * Number(item.quantity || 1);
                const stock = getCartItemStock(item);

                return (
                  <div key={item.id} style={styles.cartItem}>
                    <img
                      src={imageUrl}
                      alt={product.name || "Product"}
                      style={styles.image}
                      onError={(e) => {
                        e.currentTarget.src = "/no-image.png";
                      }}
                    />

                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>
                        {product.name || "Product"}
                      </h3>

                      {size && (
                        <div style={styles.sizeRow}>
                          <span style={styles.sizeLabel}>Size</span>
                          <span style={styles.sizeChip}>{size}</span>
                        </div>
                      )}

                      <p style={styles.price}>
                        ${finalPrice.toFixed(2)}
                        {hasDiscount && (
                          <span style={styles.oldPrice}>
                            ${basePrice.toFixed(2)}
                          </span>
                        )}
                        {size ? " / selected size" : ""}
                      </p>

                      {hasDiscount && (
                        <p style={styles.discountText}>
                          Discount: -{discountPercent}%
                        </p>
                      )}

                      {stock !== null && (
                        <p style={styles.stockText}>
                          Stock: {Number(stock).toLocaleString()}
                        </p>
                      )}

                      <p style={styles.itemTotal}>
                        Item total: ${itemTotal.toFixed(2)}
                      </p>
                    </div>

                    <div style={styles.quantityBox}>
                      <label style={styles.qtyLabel}>Qty</label>

                      <input
                        type="number"
                        min="1"
                        max={stock || undefined}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        style={styles.qtyInput}
                      />
                    </div>

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryRow}>
                <span>Items</span>
                <strong>{cartItems.length}</strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>${total.toFixed(2)}</strong>
              </div>

              <div style={styles.summaryNote}>
                Delivery fee will be calculated on the order checkout page after
                you pick the delivery location.
              </div>

              <div style={styles.summaryRow}>
                <span>Total</span>
                <strong style={styles.total}>${total.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  opacity: ordering ? 0.7 : 1,
                  cursor: ordering ? "not-allowed" : "pointer",
                }}
                disabled={ordering}
                onClick={placeOrder}
              >
                {ordering ? "Ordering..." : "Order"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function getApiBaseUrl() {
  const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000/api";
  return baseUrl.replace(/\/api\/?$/, "");
}

function normalizeImageUrl(image) {
  if (!image) return "/no-image.png";

  if (
    String(image).startsWith("http://") ||
    String(image).startsWith("https://")
  ) {
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

function getProductImage(product) {
  return normalizeImageUrl(
    product?.image_url ||
      product?.thumbnail ||
      product?.image ||
      product?.photo ||
      ""
  );
}

function getCartItemSize(item) {
  return (
    item?.product_size?.size ||
    item?.productSize?.size ||
    item?.size ||
    item?.selected_size ||
    item?.product_size_name ||
    ""
  );
}

function getCartItemBasePrice(item) {
  if (item?.base_price !== undefined && item?.base_price !== null) {
    return Number(item.base_price);
  }

  return Number(
    item?.product_size?.price ||
      item?.productSize?.price ||
      item?.size_price ||
      item?.selected_size_price ||
      item?.product?.price ||
      item?.price ||
      0
  );
}

function getCartItemFinalPrice(item) {
  if (item?.unit_price !== undefined && item?.unit_price !== null) {
    return Number(item.unit_price);
  }

  if (item?.price !== undefined && item?.price !== null) {
    return Number(item.price);
  }

  return getDiscountedPrice(item?.product, getCartItemBasePrice(item));
}

function getDiscountPercent(item) {
  return Number(item?.discount_percent || item?.product?.discount_percent || 0);
}

function getDiscountedPrice(product, basePrice) {
  const price = Number(basePrice || 0);
  const discountPercent = Number(product?.discount_percent || 0);

  if (discountPercent <= 0) {
    return price;
  }

  const now = new Date();

  if (product?.discount_start && new Date(product.discount_start) > now) {
    return price;
  }

  if (product?.discount_end && new Date(product.discount_end) < now) {
    return price;
  }

  return Math.max(price - price * (discountPercent / 100), 0);
}

function getCartItemStock(item) {
  const sizeStock =
    item?.product_size?.stock ||
    item?.productSize?.stock ||
    item?.size_stock ||
    item?.selected_size_stock;

  if (sizeStock !== undefined && sizeStock !== null) {
    return Number(sizeStock);
  }

  if (item?.product?.stock !== undefined && item?.product?.stock !== null) {
    return Number(item.product.stock);
  }

  return null;
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
    flexWrap: "wrap",
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
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: 22,
    alignItems: "start",
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
    flexWrap: "wrap",
  },

  image: {
    width: 86,
    height: 86,
    objectFit: "cover",
    borderRadius: 14,
    background: "#f9fafb",
    flexShrink: 0,
  },

  productInfo: {
    flex: 1,
    minWidth: 220,
  },

  productName: {
    margin: 0,
    color: COLORS.dark,
  },

  sizeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },

  sizeLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  sizeChip: {
    background: COLORS.greenLight,
    color: COLORS.greenDark,
    border: "1px solid #bbf7d0",
    borderRadius: 999,
    padding: "3px 9px",
    fontSize: 12,
    fontWeight: 900,
  },

  price: {
    margin: "7px 0 0",
    color: COLORS.primary,
    fontWeight: 900,
  },

  oldPrice: {
    color: COLORS.muted,
    textDecoration: "line-through",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 700,
  },

  discountText: {
    margin: "5px 0 0",
    color: COLORS.greenDark,
    fontWeight: 800,
    fontSize: 13,
  },

  stockText: {
    margin: "5px 0 0",
    color: COLORS.muted,
    fontWeight: 700,
    fontSize: 13,
  },

  itemTotal: {
    margin: "5px 0 0",
    color: COLORS.dark,
    fontWeight: 800,
    fontSize: 13,
  },

  quantityBox: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  qtyLabel: {
    color: COLORS.muted,
    fontSize: 12,
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

  summaryNote: {
    background: "#f9fafb",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.5,
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