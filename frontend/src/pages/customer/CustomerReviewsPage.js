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

const CustomerReviewsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("product");
  const [productReviews, setProductReviews] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const [productRes, shopRes] = await Promise.all([
        fetch(`${API_URL}/my-product-reviews`, {
          headers: authHeaders(),
        }),
        fetch(`${API_URL}/my-shop-reviews`, {
          headers: authHeaders(),
        }),
      ]);

      const productData = await productRes.json();
      const shopData = await shopRes.json();

      if (!productRes.ok) {
        throw new Error(productData.message || "Failed to load product reviews");
      }

      if (!shopRes.ok) {
        throw new Error(shopData.message || "Failed to load shop reviews");
      }

      setProductReviews(productData.product_reviews || []);
      setShopReviews(shopData.shop_reviews || []);
    } catch (error) {
      showMessage(error.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const reviews = activeTab === "product" ? productReviews : shopReviews;

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Reviews</h1>
            <p style={styles.subtitle}>
              View your real product reviews and shop reviews.
            </p>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/customer/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "product" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("product")}
          >
            Product Reviews ({productReviews.length})
          </button>

          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "shop" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("shop")}
          >
            Shop Reviews ({shopReviews.length})
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingCard}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon="⭐"
            title={
              activeTab === "product"
                ? "No product reviews yet"
                : "No shop reviews yet"
            }
            text={
              activeTab === "product"
                ? "After you review products, your product reviews will appear here."
                : "After you review shops, your shop reviews will appear here."
            }
            buttonText="Continue Shopping"
            onClick={() => navigate("/")}
          />
        ) : (
          <div style={styles.reviewList}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                type={activeTab}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function ReviewCard({ review, type, navigate }) {
  const isProduct = type === "product";

  const title = isProduct
    ? review.product?.name || review.product_name || "Product"
    : review.shop?.shop_name || review.shop?.name || review.shop_name || "Shop";

  const subtitle = isProduct
    ? review.product?.shop?.shop_name ||
      review.product?.shop?.name ||
      review.shop_name ||
      "Product Review"
    : "Shop Review";

  const image = isProduct
    ? review.product?.image_url || review.product?.image || "/no-image.png"
    : review.shop?.logo_url || review.shop?.logo || review.shop?.image || "/no-image.png";

  const handleView = () => {
    if (isProduct && review.product_id) {
      navigate(`/products/${review.product_id}`);
      return;
    }

    if (!isProduct && review.shop_id) {
      navigate(`/store/${review.shop_id}`);
    }
  };

  return (
    <div style={styles.reviewCard}>
      <div style={styles.reviewContent}>
        <div style={styles.imageBox}>
          <img
            src={image}
            alt={title}
            style={styles.image}
            onError={(e) => {
              e.currentTarget.src = "/no-image.png";
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={styles.reviewTop}>
            <div>
              <h3 style={styles.reviewTitle}>{title}</h3>
              <p style={styles.reviewType}>{subtitle}</p>
            </div>

            <div style={styles.rating}>⭐ {review.rating}</div>
          </div>

          <p style={styles.comment}>{review.comment}</p>

          <div style={styles.footer}>
            <span style={styles.date}>
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : ""}
            </span>

            <button style={styles.viewButton} onClick={handleView}>
              View {isProduct ? "Product" : "Shop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  tabs: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 8,
    display: "flex",
    gap: 8,
    marginBottom: 20,
    width: "fit-content",
  },

  tabButton: {
    border: "none",
    background: "transparent",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    color: COLORS.muted,
  },

  activeTab: {
    background: COLORS.primary,
    color: COLORS.white,
  },

  loadingCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 24,
    color: COLORS.muted,
    textAlign: "center",
    fontWeight: 700,
  },

  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  reviewCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  reviewContent: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },

  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 14,
    background: "#f9fafb",
    overflow: "hidden",
    flexShrink: 0,
    border: `1px solid ${COLORS.border}`,
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },

  reviewTitle: {
    margin: 0,
    color: COLORS.dark,
  },

  reviewType: {
    margin: "4px 0 0",
    color: COLORS.muted,
    fontSize: 13,
  },

  rating: {
    background: "#fff0f1",
    color: COLORS.primary,
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  comment: {
    color: COLORS.dark,
    lineHeight: 1.6,
    margin: "12px 0",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  date: {
    color: COLORS.muted,
    fontSize: 13,
  },

  viewButton: {
    background: "#fff0f1",
    color: COLORS.primary,
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
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

export default CustomerReviewsPage;