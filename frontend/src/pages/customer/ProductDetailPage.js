import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
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
  greenBg: "#ecfdf5",
  greenText: "#15803d",
};

const SIZE_ORDER = {
  xs: 1,
  s: 2,
  m: 3,
  l: 4,
  xl: 5,
  xxl: 6,
  xxxl: 7,
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
  const [selectedSize, setSelectedSize] = useState(null);

  const [productRating, setProductRating] = useState(5);
  const [productComment, setProductComment] = useState("");

  const [shopRating, setShopRating] = useState(5);
  const [shopComment, setShopComment] = useState("");

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const orderedSizes = useMemo(() => {
    return getOrderedSizes(product?.sizes || []);
  }, [product]);

  useEffect(() => {
    if (orderedSizes.length > 0) {
      setSelectedSize((prev) => {
        if (!prev) return orderedSizes[0];

        const stillExists = orderedSizes.find((size) => size.id === prev.id);
        return stillExists || orderedSizes[0];
      });
    } else {
      setSelectedSize(null);
    }
  }, [orderedSizes]);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2800);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/products/${id}`);
      const loadedProduct = res.data.product;

      setProduct(loadedProduct);

      setProductReviews(
        res.data.product_reviews?.data || res.data.product_reviews || []
      );

      setShopReviews(res.data.shop_reviews?.data || res.data.shop_reviews || []);
    } catch (error) {
      console.error("Fetch product error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  const requireLogin = () => {
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("openAuthPopup", {
          detail: {
            type: "login",
            message: "Login to continue",
          },
        })
      );

      return false;
    }

    if (user.role !== "user" && user.role !== "customer") {
      showMessage("Only customers can use this function.");
      return false;
    }

    return true;
  };

  const isDiscountActive = () => {
    const discountPercent = Number(
      product?.discount_percent || product?.discount || 0
    );
    const discountPrice = Number(product?.discount_price || 0);

    if (discountPercent <= 0 && discountPrice <= 0) {
      return false;
    }

    const now = new Date();

    if (product?.discount_start && new Date(product.discount_start) > now) {
      return false;
    }

    if (product?.discount_end && new Date(product.discount_end) < now) {
      return false;
    }

    return true;
  };

  const getDiscountInfo = (basePrice = product?.price) => {
    const price = Number(basePrice || 0);
    const discountPercent = Number(
      product?.discount_percent || product?.discount || 0
    );
    const discountPrice = Number(product?.discount_price || 0);

    if (price <= 0 || !isDiscountActive()) {
      return {
        hasDiscount: false,
        originalPrice: price,
        finalPrice: price,
        discountPercent: 0,
      };
    }

    if (discountPrice > 0 && discountPrice < price) {
      return {
        hasDiscount: true,
        originalPrice: price,
        finalPrice: discountPrice,
        discountPercent: Math.round(((price - discountPrice) / price) * 100),
      };
    }

    if (discountPercent > 0) {
      return {
        hasDiscount: true,
        originalPrice: price,
        finalPrice: price - price * (discountPercent / 100),
        discountPercent,
      };
    }

    return {
      hasDiscount: false,
      originalPrice: price,
      finalPrice: price,
      discountPercent: 0,
    };
  };

  const handleAddToCart = async () => {
    if (!requireLogin()) return;

    if (orderedSizes.length > 0 && !selectedSize) {
      showMessage("Please select a size.");
      return;
    }

    const displayStock = selectedSize?.stock ?? product.stock ?? 0;
    const cleanQuantity = Number(quantity || 1);

    if (cleanQuantity < 1) {
      showMessage("Quantity must be at least 1.");
      return;
    }

    if (displayStock < cleanQuantity) {
      showMessage("Not enough stock available.");
      return;
    }

    try {
      setCartLoading(true);

      await api.post("/cart", {
        product_id: product.id,
        product_size_id: selectedSize?.id || null,
        size: selectedSize?.size || null,
        quantity: cleanQuantity,
      });

      showMessage("Product added to cart.");
    } catch (error) {
      console.error("Add to cart error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to add to cart.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!requireLogin()) return;

    try {
      setWishlistLoading(true);

      const res = await api.post("/wishlist/toggle", {
        product_id: product.id,
      });

      setProduct((prev) => ({
        ...prev,
        is_wishlisted: res.data.is_wishlisted,
      }));

      showMessage(res.data.message || "Wishlist updated.");
    } catch (error) {
      console.error("Wishlist error:", error.response?.data || error);
      showMessage(error.response?.data?.message || "Failed to update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitProductReview = async (e) => {
    e.preventDefault();

    if (!requireLogin()) return;

    try {
      await api.post("/product-reviews", {
        product_id: product.id,
        rating: Number(productRating),
        comment: productComment,
      });

      setProductComment("");
      setProductRating(5);
      showMessage("Product review submitted.");
      fetchProduct();
    } catch (error) {
      console.error("Product review error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showMessage(errors);
      } else {
        showMessage(
          error.response?.data?.message || "Failed to submit product review."
        );
      }
    }
  };

  const handleSubmitShopReview = async (e) => {
    e.preventDefault();

    if (!requireLogin()) return;

    try {
      await api.post("/shop-reviews", {
        shop_id: product.shop?.id || product.shop_id,
        rating: Number(shopRating),
        comment: shopComment,
      });

      setShopComment("");
      setShopRating(5);
      showMessage("Shop review submitted.");
      fetchProduct();
    } catch (error) {
      console.error("Shop review error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showMessage(errors);
      } else {
        showMessage(
          error.response?.data?.message || "Failed to submit shop review."
        );
      }
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

  const imageUrl = getProductImage(product);
  const shopName = product.shop?.shop_name || product.shop?.name || "Shop";
  const reviewCount = product.reviews_count || 0;
  const averageRating = product.average_rating;
  const sold = product.sold || product.total_sold || 0;

  const displayPrice = selectedSize?.price || product.price;
  const displayStock = selectedSize?.stock ?? product.stock;
  const discountInfo = getDiscountInfo(displayPrice);
  const outOfStock = Number(displayStock || 0) <= 0;

  return (
    <div style={styles.page}>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.main}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/")}
        >
          ← Back to Store
        </button>

        <section style={styles.productGrid}>
          <div style={styles.imageCard}>
            <div style={styles.imageBox}>
              <img
                src={imageUrl}
                alt={product.name}
                style={styles.productImage}
                onError={(e) => {
                  e.currentTarget.src = "/no-image.png";
                }}
              />

              {discountInfo.hasDiscount && (
                <span style={styles.discountBadge}>
                  -{discountInfo.discountPercent}%
                </span>
              )}
            </div>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.shopName}>{shopName}</p>
            <h1 style={styles.productName}>{product.name}</h1>

            <div style={styles.metaLine}>
              {averageRating ? (
                <span>⭐ {Number(averageRating).toFixed(1)}</span>
              ) : (
                <span>No rating</span>
              )}

              <span>·</span>
              <span>
                {reviewCount} review{reviewCount === 1 ? "" : "s"}
              </span>
              <span>·</span>
              <span>{Number(sold).toLocaleString()} sold</span>
            </div>

            <p style={styles.description}>
              {product.description || "No description available."}
            </p>

            <div style={styles.priceBox}>
              <span style={styles.priceLabel}>Price</span>

              <div style={styles.priceRight}>
                <strong style={styles.price}>
                  ${discountInfo.finalPrice.toFixed(2)}
                </strong>

                {discountInfo.hasDiscount && (
                  <span style={styles.oldPrice}>
                    ${discountInfo.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {discountInfo.hasDiscount && (
              <div style={styles.discountBox}>
                Discount: {discountInfo.discountPercent}% off
              </div>
            )}

            {orderedSizes.length > 0 && (
              <div style={styles.sizeBox}>
                <label style={styles.label}>Size</label>

                <div style={styles.sizeOptions}>
                  {orderedSizes.map((size) => {
                    const isActive = selectedSize?.id === size.id;
                    const isOutOfStock = Number(size.stock || 0) <= 0;
                    const sizeDiscountInfo = getDiscountInfo(
                      size.price || product.price
                    );

                    return (
                      <button
                        key={size.id || size.size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(size);
                          setQuantity(1);
                        }}
                        style={{
                          ...styles.sizeButton,
                          ...(isActive ? styles.activeSizeButton : {}),
                          ...(isOutOfStock ? styles.disabledSizeButton : {}),
                        }}
                      >
                        <span style={styles.sizeName}>{size.size}</span>

                        <strong>
                          ${sizeDiscountInfo.finalPrice.toFixed(2)}
                          {sizeDiscountInfo.hasDiscount && (
                            <span style={styles.sizeOldPrice}>
                              ${sizeDiscountInfo.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </strong>

                        <small>
                          {isOutOfStock
                            ? "Out of stock"
                            : `Stock: ${size.stock ?? product.stock ?? 0}`}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {orderedSizes.length === 0 && (
              <div style={styles.noSizeBox}>This product has no size option.</div>
            )}

            <div style={styles.quantityBox}>
              <label style={styles.label}>Quantity</label>

              <input
                type="number"
                min="1"
                max={displayStock || undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={styles.quantityInput}
              />

              <span style={styles.stockText}>
                Stock: {Number(displayStock || 0).toLocaleString()}
              </span>
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  opacity: cartLoading || outOfStock ? 0.65 : 1,
                  cursor: cartLoading || outOfStock ? "not-allowed" : "pointer",
                }}
                onClick={handleAddToCart}
                disabled={cartLoading || outOfStock}
              >
                {cartLoading
                  ? "Adding..."
                  : outOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              <button
                type="button"
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
                type="button"
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

              <button type="submit" style={styles.primaryButton}>
                Submit Product Review
              </button>
            </form>

            <ReviewList
              reviews={productReviews}
              emptyText="No product reviews yet."
            />
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

              <button type="submit" style={styles.primaryButton}>
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

function normalizeSizeName(size) {
  return String(size || "").trim().toUpperCase();
}

function getOrderedSizes(sizes) {
  const seen = new Set();

  return [...sizes]
    .filter((item) => item && item.size)
    .map((item) => ({
      ...item,
      size: normalizeSizeName(item.size),
    }))
    .filter((item) => {
      const key = item.size.toLowerCase();

      if (!SIZE_ORDER[key]) return false;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const orderA = SIZE_ORDER[String(a.size).toLowerCase()] || 999;
      const orderB = SIZE_ORDER[String(b.size).toLowerCase()] || 999;

      return orderA - orderB;
    });
}

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
    width: "100%",
    maxWidth: 1200,
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
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    fontWeight: 800,
    whiteSpace: "pre-line",
    maxWidth: 360,
  },

  backButton: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    color: COLORS.dark,
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    marginBottom: 18,
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: 24,
    marginBottom: 24,
  },

  imageCard: {
    background: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },

  imageBox: {
    position: "relative",
    width: "100%",
    height: "min(520px, 70vw)",
    minHeight: 300,
    borderRadius: 16,
    overflow: "hidden",
    background: "#f9fafb",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  discountBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    background: COLORS.primary,
    color: COLORS.white,
    padding: "6px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 13,
  },

  infoCard: {
    background: COLORS.white,
    borderRadius: 22,
    padding: "clamp(18px, 3vw, 24px)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
    minWidth: 0,
  },

  shopName: {
    color: COLORS.primaryDark,
    fontWeight: 900,
    margin: 0,
  },

  productName: {
    margin: "10px 0",
    color: COLORS.dark,
    fontSize: "clamp(28px, 4vw, 38px)",
  },

  metaLine: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 14,
  },

  description: {
    color: COLORS.muted,
    lineHeight: 1.7,
  },

  priceBox: {
    marginTop: 18,
    padding: 16,
    background: COLORS.primaryLight,
    borderRadius: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  priceLabel: {
    color: COLORS.muted,
    fontWeight: 800,
  },

  priceRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  price: {
    color: COLORS.primaryDark,
    fontSize: 26,
  },

  oldPrice: {
    color: COLORS.muted,
    textDecoration: "line-through",
    fontWeight: 800,
  },

  discountBox: {
    marginTop: 12,
    background: COLORS.greenBg,
    color: COLORS.greenText,
    padding: 12,
    borderRadius: 12,
    fontWeight: 800,
  },

  sizeBox: {
    marginTop: 18,
  },

  sizeOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  sizeButton: {
    minWidth: 105,
    background: COLORS.white,
    color: COLORS.dark,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-start",
    fontWeight: 800,
  },

  activeSizeButton: {
    background: COLORS.primaryLight,
    borderColor: COLORS.primary,
    color: COLORS.primaryDark,
  },

  disabledSizeButton: {
    background: "#f3f4f6",
    color: COLORS.muted,
    borderColor: "#e5e7eb",
    cursor: "not-allowed",
    opacity: 0.65,
  },

  sizeName: {
    fontSize: 16,
    fontWeight: 900,
  },

  sizeOldPrice: {
    color: COLORS.muted,
    textDecoration: "line-through",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 700,
  },

  noSizeBox: {
    marginTop: 18,
    background: "#f9fafb",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.softBorder,
    borderRadius: 12,
    padding: 12,
    color: COLORS.muted,
    fontWeight: 800,
  },

  quantityBox: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  label: {
    display: "block",
    marginBottom: 8,
    color: COLORS.dark,
    fontWeight: 800,
  },

  quantityInput: {
    width: 100,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 15,
  },

  stockText: {
    color: COLORS.muted,
    fontWeight: 800,
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
    background: COLORS.primaryDark,
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: 24,
  },

  card: {
    background: COLORS.white,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: "clamp(18px, 2.5vw, 22px)",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "11px 12px",
    background: COLORS.white,
  },

  textarea: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: "11px 12px",
    minHeight: 100,
    resize: "vertical",
    fontFamily: "inherit",
  },

  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  reviewItem: {
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: COLORS.softBorder,
    paddingTop: 12,
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