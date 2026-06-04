import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

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

function getApiBaseUrl() {
  const baseUrl = api.defaults.baseURL || "http://127.0.0.1:8000/api";
  return baseUrl.replace(/\/api\/?$/, "");
}

function normalizeImageUrl(image) {
  if (!image) return "/no-image.png";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/storage/")) {
    return `${getApiBaseUrl()}${image}`;
  }

  if (image.startsWith("storage/")) {
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

function getProductPrice(product) {
  const price = Number(product?.price || 0);
  const discountPercent = Number(product?.discount_percent || 0);
  const discountPrice = Number(product?.discount_price || 0);

  if (discountPrice > 0 && discountPrice < price) {
    return {
      originalPrice: price,
      finalPrice: discountPrice,
      discount: Math.round(((price - discountPrice) / price) * 100),
    };
  }

  if (discountPercent > 0) {
    return {
      originalPrice: price,
      finalPrice: price - price * (discountPercent / 100),
      discount: discountPercent,
    };
  }

  return {
    originalPrice: price,
    finalPrice: price,
    discount: 0,
  };
}

function getShopLogo(shop) {
  return (
    shop?.shop_logo_url ||
    shop?.logo_url ||
    shop?.image_url ||
    shop?.shop_logo ||
    shop?.logo ||
    shop?.image ||
    ""
  );
}

function getShopName(shop) {
  return shop?.shop_name || shop?.name || "Shop";
}

function formatRating(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);

  if (Number.isNaN(number)) return null;

  return number.toFixed(1);
}

function getProductSizes(product) {
  if (!product?.sizes || !Array.isArray(product.sizes)) return [];

  const sizeOrder = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
    xxl: 6,
    xxxl: 7,
  };

  return [...product.sizes]
    .filter((item) => item?.size)
    .sort((a, b) => {
      const sizeA = String(a.size).toLowerCase().trim();
      const sizeB = String(b.size).toLowerCase().trim();

      const orderA = sizeOrder[sizeA] || Number(sizeA) || 999;
      const orderB = sizeOrder[sizeB] || Number(sizeB) || 999;

      return orderA - orderB;
    })
    .slice(0, 4);
}

function ShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchShop();
  }, [id]);

  const fetchShop = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/shops/${id}`);
      const data = res.data.data || res.data.shop || res.data;

      setShop(data);
      setProducts(data.products || []);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Fetch shop error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Failed to load shop.");
    } finally {
      setLoading(false);
    }
  };

  const openShopLocation = () => {
    if (!shop?.latitude || !shop?.longitude) return;

    const lat = Number(shop.latitude);
    const lng = Number(shop.longitude);

    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.emptyCard}>Loading shop...</div>
        </main>
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={styles.page}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.emptyCard}>
            {message || "Shop not found."}
          </div>
        </main>
      </div>
    );
  }

  const shopLogo = getShopLogo(shop);
  const shopName = getShopName(shop);
  const rating = formatRating(shop.average_rating);
  const reviewCount = shop.reviews_count || reviews.length || 0;
  const productCount = shop.products_count || products.length || 0;
  const hasLocation = Boolean(shop.latitude && shop.longitude);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

        {message && <div style={styles.errorBox}>{message}</div>}

        <section style={styles.heroCard}>
          <div style={styles.logoBox}>
            {shopLogo ? (
              <img
                src={shopLogo}
                alt={shopName}
                style={styles.logoImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span style={styles.logoFallback}>🏪</span>
            )}
          </div>

          <div style={styles.shopInfo}>
            <p style={styles.kicker}>Shop</p>
            <h1 style={styles.shopName}>{shopName}</h1>

            <p style={styles.description}>
              {shop.description || "No shop description available."}
            </p>

            <div style={styles.metaRow}>
              <span>📦 {Number(productCount).toLocaleString()} products</span>

              {rating ? (
                <span>
                  ⭐ {rating} · {reviewCount} review
                  {reviewCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span>No reviews yet</span>
              )}

              {shop.phone && <span>📞 {shop.phone}</span>}
            </div>
          </div>
        </section>

        <section style={styles.locationCard}>
          <div>
            <h2 style={styles.sectionTitle}>Shop Location</h2>
            <p style={styles.locationText}>
              {shop.address || "No shop address available."}
            </p>

            {hasLocation ? (
              <p style={styles.coordinateText}>
                {Number(shop.latitude).toFixed(6)},{" "}
                {Number(shop.longitude).toFixed(6)}
              </p>
            ) : (
              <p style={styles.noLocationText}>No map location selected.</p>
            )}
          </div>

          <button
            type="button"
            style={{
              ...styles.mapButton,
              opacity: hasLocation ? 1 : 0.55,
              cursor: hasLocation ? "pointer" : "not-allowed",
            }}
            disabled={!hasLocation}
            onClick={openShopLocation}
          >
            Open Map
          </button>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Products from this shop</h2>
              <p style={styles.sectionSubtitle}>
                Browse products available from {shopName}.
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={styles.emptyCard}>No products in this shop yet.</div>
          ) : (
            <div style={styles.productGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Shop Reviews</h2>
              <p style={styles.sectionSubtitle}>
                Customer feedback for this shop.
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div style={styles.emptyCard}>No shop reviews yet.</div>
          ) : (
            <div style={styles.reviewList}>
              {reviews.map((review) => (
                <div key={review.id} style={styles.reviewItem}>
                  <div style={styles.reviewTop}>
                    <strong>{review.user?.name || "Customer"}</strong>
                    <span style={styles.rating}>⭐ {review.rating}</span>
                  </div>

                  <p style={styles.reviewText}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const imageUrl = getProductImage(product);
  const { originalPrice, finalPrice, discount } = getProductPrice(product);
  const sizes = getProductSizes(product);

  return (
    <div style={styles.productCard} onClick={onClick}>
      <div style={styles.productImageBox}>
        <img
          src={imageUrl}
          alt={product.name}
          style={styles.productImage}
          onError={(e) => {
            e.currentTarget.src = "/no-image.png";
          }}
        />

        {discount > 0 && <span style={styles.discountBadge}>-{discount}%</span>}
      </div>

      <p style={styles.productName}>{product.name}</p>

      {sizes.length > 0 && (
        <div style={styles.sizeList}>
          {sizes.map((item) => (
            <span key={item.id || item.size} style={styles.sizeChip}>
              {item.size}
            </span>
          ))}

          {product.sizes.length > 4 && (
            <span style={styles.sizeMore}>+{product.sizes.length - 4}</span>
          )}
        </div>
      )}

      <div style={styles.priceRow}>
        <strong style={styles.finalPrice}>${finalPrice.toFixed(2)}</strong>

        {discount > 0 && (
          <span style={styles.oldPrice}>${originalPrice.toFixed(2)}</span>
        )}
      </div>
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "clamp(18px, 3vw, 32px)",
    boxSizing: "border-box",
  },

  backButton: {
    background: COLORS.white,
    color: COLORS.dark,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: 18,
  },

  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fecaca",
    padding: "12px 14px",
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 800,
  },

  heroCard: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: "clamp(18px, 3vw, 28px)",
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    display: "grid",
    gridTemplateColumns: "130px minmax(0, 1fr)",
    gap: 22,
    alignItems: "center",
    marginBottom: 22,
  },

  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 26,
    background: COLORS.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  logoFallback: {
    fontSize: 54,
  },

  shopInfo: {
    minWidth: 0,
  },

  kicker: {
    margin: "0 0 6px",
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  shopName: {
    margin: 0,
    color: COLORS.dark,
    fontSize: "clamp(30px, 4vw, 42px)",
  },

  description: {
    color: COLORS.muted,
    lineHeight: 1.6,
    margin: "10px 0 14px",
  },

  metaRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    color: COLORS.primaryDark,
    fontWeight: 800,
    fontSize: 13,
  },

  locationCard: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },

  locationText: {
    margin: "6px 0",
    color: COLORS.dark,
    fontWeight: 800,
    overflowWrap: "anywhere",
  },

  coordinateText: {
    margin: 0,
    color: COLORS.primaryDark,
    fontWeight: 800,
    fontSize: 13,
  },

  noLocationText: {
    margin: 0,
    color: COLORS.muted,
    fontWeight: 700,
    fontSize: 13,
  },

  mapButton: {
    background: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: 12,
    padding: "11px 16px",
    fontWeight: 900,
  },

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    margin: 0,
    color: COLORS.dark,
    fontSize: 22,
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: COLORS.muted,
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))",
    gap: 16,
  },

  productCard: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
  },

  productImageBox: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: 12,
    background: "#f9fafb",
    overflow: "hidden",
    position: "relative",
    marginBottom: 10,
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: COLORS.primary,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 8px",
    borderRadius: 999,
  },

  productName: {
    margin: "0 0 7px",
    color: COLORS.dark,
    fontWeight: 800,
    minHeight: 38,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },

  sizeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 7,
  },

  sizeChip: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 999,
    padding: "2px 7px",
    fontSize: 10,
    fontWeight: 900,
    lineHeight: 1.4,
  },

  sizeMore: {
    background: "#f3f4f6",
    color: COLORS.muted,
    borderRadius: 999,
    padding: "2px 7px",
    fontSize: 10,
    fontWeight: 900,
    lineHeight: 1.4,
  },

  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },

  finalPrice: {
    color: COLORS.primaryDark,
    fontSize: 16,
  },

  oldPrice: {
    color: COLORS.muted,
    fontSize: 12,
    textDecoration: "line-through",
  },

  reviewList: {
    display: "grid",
    gap: 12,
  },

  reviewItem: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },

  reviewTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  rating: {
    color: COLORS.primaryDark,
    fontWeight: 900,
  },

  reviewText: {
    margin: "8px 0 0",
    color: COLORS.muted,
    lineHeight: 1.6,
  },

  emptyCard: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 22,
    color: COLORS.muted,
    fontWeight: 800,
    textAlign: "center",
  },
};

export default ShopDetailPage;