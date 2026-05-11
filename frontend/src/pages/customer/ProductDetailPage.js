import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { API_URL, authHeaders } from "../../services/api";

const COLORS = {
  primary: "#E8192C",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f4f6fb",
  white: "#ffffff",
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [productRating, setProductRating] = useState(5);
  const [productComment, setProductComment] = useState("");

  const [shopRating, setShopRating] = useState(5);
  const [shopComment, setShopComment] = useState("");

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/products/${id}`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load product");
      }

      setProduct(data.product);
      setProductReviews(data.product_reviews || []);
      setShopReviews(data.shop_reviews || []);
    } catch (error) {
      showMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const requireLogin = () => {
    if (!user) {
      navigate("/login", {
        state: {
          message: "Login to continue",
        },
      });
      return false;
    }

    if (user.role !== "user") {
      showMessage("Only customers can use this function.");
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!requireLogin()) return;

    try {
      setCartLoading(true);

      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      showMessage("Product added to cart.");
    } catch (error) {
      showMessage(error.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!requireLogin()) return;

    try {
      setWishlistLoading(true);

      const res = await fetch(`${API_URL}/wishlist/toggle`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          product_id: product.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update wishlist");
      }

      setProduct((prev) => ({
        ...prev,
        is_wishlisted: data.is_wishlisted,
      }));

      showMessage(data.message || "Wishlist updated.");
    } catch (error) {
      showMessage(error.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitProductReview = async (e) => {
    e.preventDefault();

    if (!requireLogin()) return;

    try {
      const res = await fetch(`${API_URL}/product-reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          rating: Number(productRating),
          comment: productComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit product review");
      }

      setProductComment("");
      setProductRating(5);
      showMessage("Product review submitted.");
      fetchProduct();
    } catch (error) {
      showMessage(error.message || "Failed to submit product review");
    }
  };

  const handleSubmitShopReview = async (e) => {
    e.preventDefault();

    if (!requireLogin()) return;

    try {
      const res = await fetch(`${API_URL}/shop-reviews`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          shop_id: product.shop?.id,
          rating: Number(shopRating),
          comment: shopComment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit shop review");
      }

      setShopComment("");
      setShopRating(5);
      showMessage("Shop review submitted.");
      fetchProduct();
    } catch (error) {
      showMessage(error.message || "Failed to submit shop review");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.card}>Loading product...</div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.card}>Product not found.</div>
        </main>
      </div>
    );
  }

  const imageUrl =
    product.image_url ||
    product.thumbnail ||
    product.image ||
    "https://via.placeholder.com/600x600?text=Product";

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Store
        </button>

        <section style={styles.productGrid}>
          <div style={styles.imageCard}>
            <img src={imageUrl} alt={product.name} style={styles.productImage} />
          </div>

          <div style={styles.infoCard}>
            <p style={styles.shopName}>{product.shop?.name || "Shop"}</p>

            <h1 style={styles.productName}>{product.name}</h1>

            <p style={styles.description}>
              {product.description || "No description available."}
            </p>

            <div style={styles.priceBox}>
              <span style={styles.priceLabel}>Price</span>
              <strong style={styles.price}>${Number(product.price).toFixed(2)}</strong>
            </div>

            {product.discount_price && (
              <div style={styles.discountBox}>
                Discount Price: ${Number(product.discount_price).toFixed(2)}
              </div>
            )}

            <div style={styles.quantityBox}>
              <label style={styles.label}>Quantity</label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={styles.quantityInput}
              />
            </div>

            <div style={styles.actions}>
              <button
                style={styles.primaryButton}
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </button>

              <button
                style={styles.secondaryButton}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading
                  ? "Saving..."
                  : product.is_wishlisted
                  ? "Remove Wishlist"
                  : "Add Wishlist"}
              </button>

              <button
                style={styles.lightButton}
                onClick={() => navigate("/customer/cart")}
              >
                Go to Cart
              </button>
            </div>
          </div>
        </section>

        <section style={styles.reviewGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Product Reviews</h2>

            <form style={styles.reviewForm} onSubmit={handleSubmitProductReview}>
              <label style={styles.label}>Rating</label>
              <select
                style={styles.input}
                value={productRating}
                onChange={(e) => setProductRating(e.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Normal</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Very Bad</option>
              </select>

              <label style={styles.label}>Comment</label>
              <textarea
                style={styles.textarea}
                value={productComment}
                onChange={(e) => setProductComment(e.target.value)}
                placeholder="Write your product review..."
                required
              />

              <button style={styles.primaryButton} type="submit">
                Submit Product Review
              </button>
            </form>

            <ReviewList reviews={productReviews} emptyText="No product reviews yet." />
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Shop Reviews</h2>

            <form style={styles.reviewForm} onSubmit={handleSubmitShopReview}>
              <label style={styles.label}>Rating</label>
              <select
                style={styles.input}
                value={shopRating}
                onChange={(e) => setShopRating(e.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Normal</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Very Bad</option>
              </select>

              <label style={styles.label}>Comment</label>
              <textarea
                style={styles.textarea}
                value={shopComment}
                onChange={(e) => setShopComment(e.target.value)}
                placeholder="Write your shop review..."
                required
              />

              <button style={styles.primaryButton} type="submit">
                Submit Shop Review
              </button>
            </form>

            <ReviewList reviews={shopReviews} emptyText="No shop reviews yet." />
          </div>
        </section>
      </main>
    </div>
  );
};

function ReviewList({ reviews, emptyText }) {
  if (!reviews || reviews.length === 0) {
    return <p style={styles.emptyText}>{emptyText}</p>;
  }

  return (
    <div style={styles.reviewList}>
      {reviews.map((review) => (
        <div key={review.id} style={styles.reviewItem}>
          <div style={styles.reviewTop}>
            <strong>{review.user?.name || "Customer"}</strong>
            <span style={styles.rating}>⭐ {review.rating}</span>
          </div>

          <p style={styles.reviewComment}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: COLORS.bg,
  },

  main: {
    maxWidth: 1200,
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
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    fontWeight: 800,
  },

  backButton: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.dark,
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    marginBottom: 18,
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 24,
  },

  imageCard: {
    background: COLORS.white,
    borderRadius: 22,
    padding: 18,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  productImage: {
    width: "100%",
    height: 520,
    objectFit: "cover",
    borderRadius: 16,
    background: "#f9fafb",
  },

  infoCard: {
    background: COLORS.white,
    borderRadius: 22,
    padding: 24,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  shopName: {
    color: COLORS.primary,
    fontWeight: 900,
    margin: 0,
  },

  productName: {
    margin: "10px 0",
    color: COLORS.dark,
    fontSize: 34,
  },

  description: {
    color: COLORS.muted,
    lineHeight: 1.7,
  },

  priceBox: {
    marginTop: 18,
    padding: 16,
    background: "#fff0f1",
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceLabel: {
    color: COLORS.muted,
    fontWeight: 800,
  },

  price: {
    color: COLORS.primary,
    fontSize: 26,
  },

  discountBox: {
    marginTop: 12,
    background: "#ecfdf5",
    color: "#15803d",
    padding: 12,
    borderRadius: 12,
    fontWeight: 800,
  },

  quantityBox: {
    marginTop: 18,
  },

  label: {
    display: "block",
    marginBottom: 8,
    color: COLORS.dark,
    fontWeight: 800,
  },

  quantityInput: {
    width: 100,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 15,
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },

  primaryButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  secondaryButton: {
    background: COLORS.dark,
    color: COLORS.white,
    border: "none",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  lightButton: {
    background: COLORS.white,
    color: COLORS.dark,
    border: `1px solid ${COLORS.border}`,
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  card: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  sectionTitle: {
    marginTop: 0,
    color: COLORS.dark,
  },

  reviewForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 22,
  },

  input: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "11px 12px",
  },

  textarea: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "11px 12px",
    minHeight: 100,
    resize: "vertical",
  },

  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  reviewItem: {
    borderTop: "1px solid #f1f1f1",
    paddingTop: 12,
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  rating: {
    color: COLORS.primary,
    fontWeight: 900,
  },

  reviewComment: {
    color: COLORS.muted,
    lineHeight: 1.6,
  },

  emptyText: {
    color: COLORS.muted,
    background: "#f9fafb",
    padding: 14,
    borderRadius: 12,
  },
};

export default ProductDetailPage;