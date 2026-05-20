import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const COLORS = {
  primary: "#16a34a",
  primaryDark: "#166534",
  primaryLight: "#dcfce7",
  blue: "#2563eb",
  orange: "#f97316",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#bbf7d0",
  softBorder: "#e5e7eb",
  bg: "#f0fdf4",
  white: "#ffffff",
};

const HERO_SLIDES = [
  {
    bg: "linear-gradient(135deg,#166534,#16a34a)",
    accent: "#facc15",
    badge: "BEST DEAL",
    title: "Newest Products",
    subtitle: "Discover the latest items from real shops",
    cta: "Shop Now",
    target: "best_deal",
  },
  {
    bg: "linear-gradient(135deg,#15803d,#22c55e)",
    accent: "#ffffff",
    badge: "FLASH SALE",
    title: "Discount Deals Today",
    subtitle: "Products with discounts from shop owners",
    cta: "Grab Deal",
    target: "flash_sale",
  },
  {
    bg: "linear-gradient(135deg,#0f766e,#14b8a6)",
    accent: "#facc15",
    badge: "TRENDING",
    title: "Most Sold Products",
    subtitle: "Popular products customers are buying",
    cta: "View Trending",
    target: "trending",
  },
];

const BRANDS = [
  { name: "Samsung", bg: "#1428A0" },
  { name: "Apple", bg: "#555" },
  { name: "Nike", bg: "#111" },
  { name: "Adidas", bg: "#222" },
  { name: "Sony", bg: "#333" },
  { name: "LG", bg: "#A50034" },
];

function getCategoryIcon(categoryName) {
  const name = String(categoryName || "").toLowerCase();

  if (name.includes("electronic")) return "💻";
  if (name.includes("fashion")) return "👗";
  if (name.includes("beauty")) return "💄";
  if (name.includes("home")) return "🏠";
  if (name.includes("grocer")) return "🛒";
  if (name.includes("sport")) return "⚽";
  if (name.includes("book")) return "📚";
  if (name.includes("toy")) return "🧸";
  if (name.includes("auto")) return "🚗";
  if (name.includes("health")) return "💊";

  return "🛍️";
}

function getShopName(shop) {
  return shop?.name || shop?.shop_name || shop?.store_name || "Shop";
}

function getShopLogo(shop) {
  return (
    shop?.logo ||
    shop?.image ||
    shop?.photo ||
    shop?.thumbnail ||
    "/no-image.png"
  );
}

function getProductImage(product) {
  return (
    product?.image_url ||
    product?.thumbnail ||
    product?.image ||
    product?.photo ||
    product?.img ||
    "/no-image.png"
  );
}

function getProductPrice(product) {
  const price = Number(product?.price || 0);
  const discountPercent = Number(product?.discount_percent || product?.discount || 0);
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

function formatRating(value) {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);

  if (Number.isNaN(number)) return null;

  return number.toFixed(1);
}

function HeroBanner({ onAction }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % HERO_SLIDES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <div style={{ ...styles.hero, background: slide.bg }}>
      <div style={styles.heroContent}>
        <div
          style={{
            ...styles.heroBadge,
            background: slide.accent,
            color: slide.accent === "#ffffff" ? COLORS.primaryDark : COLORS.text,
          }}
        >
          {slide.badge}
        </div>

        <h2 style={styles.heroTitle}>{slide.title}</h2>
        <p style={styles.heroSubtitle}>{slide.subtitle}</p>

        <button
          onClick={() => onAction(slide.target)}
          style={{
            ...styles.heroButton,
            background: slide.accent,
            color: slide.accent === "#ffffff" ? COLORS.primaryDark : COLORS.text,
          }}
        >
          {slide.cta} →
        </button>
      </div>

      <div style={styles.heroIcon}>🛍️</div>

      <div style={styles.heroDots}>
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            style={{
              ...styles.heroDot,
              width: index === active ? 22 : 7,
              background: index === active ? "#ffffff" : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, onLink }) {
  return (
    <div style={styles.sectionHeader}>
      <h3 style={styles.sectionTitle}>{title}</h3>

      {onLink && (
        <button type="button" onClick={onLink} style={styles.sectionLink}>
          See all →
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, compact, onClick }) {
  const [hovered, setHovered] = useState(false);

  const imageUrl = getProductImage(product);
  const { originalPrice, finalPrice, discount } = getProductPrice(product);

  const rating = formatRating(product.average_rating);
  const reviewCount = product.reviews_count || product.product_reviews_count || 0;
  const sold = product.sold || product.total_sold || product.quantity_sold || 0;
  const hue = ((product.id || 1) * 37) % 360;

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.productCard,
        padding: compact ? 10 : 12,
        boxShadow: hovered
          ? "0 8px 22px rgba(22,163,74,0.16)"
          : "0 4px 14px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          ...styles.productImageBox,
          background: `hsl(${hue},50%,94%)`,
        }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          style={styles.productImage}
          onError={(e) => {
            e.currentTarget.src = "/no-image.png";
          }}
        />

        {!compact && discount > 0 && (
          <span style={styles.discountBadge}>-{discount}%</span>
        )}
      </div>

      <div
        style={{
          ...styles.productName,
          fontSize: compact ? 12 : 13,
          minHeight: compact ? "auto" : 34,
        }}
      >
        {product.name}
      </div>

      <div style={styles.priceRow}>
        <span
          style={{
            ...styles.finalPrice,
            fontSize: compact ? 13 : 15,
          }}
        >
          ${finalPrice.toFixed(2)}
        </span>

        {discount > 0 && (
          <span style={styles.oldPrice}>${originalPrice.toFixed(2)}</span>
        )}
      </div>

      {!compact && (
        <div style={styles.productMeta}>
          {reviewCount > 0 && rating ? (
            <>
              ⭐ {rating} · {reviewCount} review
              {reviewCount > 1 ? "s" : ""} · {Number(sold).toLocaleString()} sold
            </>
          ) : (
            <>No reviews yet · {Number(sold).toLocaleString()} sold</>
          )}
        </div>
      )}
    </div>
  );
}

function ShopCard({ shop, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  const name = getShopName(shop);
  const logo = getShopLogo(shop);
  const itemCount = shop.products_count || shop.items_count || shop.items || 0;

  const rating = formatRating(shop.average_rating);
  const reviewCount = shop.reviews_count || shop.shop_reviews_count || 0;
  const verified = shop.verified || shop.is_verified || false;

  return (
    <div
      onClick={() => onClick(shop)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.shopCard,
        boxShadow: hovered ? "0 8px 22px rgba(22,163,74,0.14)" : "none",
      }}
    >
      <div
        style={{
          ...styles.shopLogo,
          background: `hsl(${index * 70 + 180}, 50%, 90%)`,
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={styles.shopLogoImg}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span style={{ fontSize: 24 }}>🏪</span>
        )}
      </div>

      <div style={styles.shopText}>
        <div style={styles.shopName}>
          {name}
          {verified && <span style={styles.verified}> ✓</span>}
        </div>

        <div style={styles.shopMeta}>
          {reviewCount > 0 && rating ? (
            <>
              ⭐ {rating} · {reviewCount} review
              {reviewCount > 1 ? "s" : ""} · {Number(itemCount).toLocaleString()} items
            </>
          ) : (
            <>No reviews yet · {Number(itemCount).toLocaleString()} items</>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(shop);
        }}
        style={styles.visitButton}
      >
        Visit Store
      </button>
    </div>
  );
}

function PartnerShopCard({ shop, index, onClick }) {
  const name = getShopName(shop);
  const logo = getShopLogo(shop);

  const description =
    shop.description ||
    shop.address ||
    shop.phone ||
    `${shop.products_count || shop.items_count || 0} products available`;

  const bgColors = ["#fffbeb", "#f0fdf4", "#ecfdf5", "#f7fee7"];

  return (
    <div
      onClick={() => onClick(shop)}
      style={{
        ...styles.partnerCard,
        background: bgColors[index % bgColors.length],
      }}
    >
      <div style={styles.partnerLogo}>
        <img
          src={logo}
          alt={name}
          style={styles.shopLogoImg}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div style={styles.partnerText}>
        <div style={styles.partnerName}>{name}</div>
        <div style={styles.partnerDescription}>{description}</div>
        <div style={styles.partnerBrowse}>Browse →</div>
      </div>
    </div>
  );
}

function EmptyBox({ text }) {
  return <div style={styles.emptyBox}>{text}</div>;
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);

  const [homeData, setHomeData] = useState({
    flash_sale: [],
    best_deal: [],
    trending: [],
  });

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const [homeRes, categoryRes, shopRes] = await Promise.all([
        api.get("/homepage-products"),
        api.get("/categories"),
        api.get("/shops"),
      ]);

      const homeJson = homeRes.data || {};
      const categoryJson = categoryRes.data || [];
      const shopJson = shopRes.data || [];

      const realCategories = Array.isArray(categoryJson)
        ? categoryJson
        : categoryJson.data || [];

      const realShops = Array.isArray(shopJson) ? shopJson : shopJson.data || [];

      setHomeData({
        flash_sale: homeJson.flash_sale || [],
        best_deal: homeJson.best_deal || [],
        trending: homeJson.trending || [],
      });

      setShops(realShops);

      setCategories(
        realCategories.map((cat) => ({
          id: cat.id,
          icon: cat.icon || getCategoryIcon(cat.name),
          label: cat.name,
          route: `/category/${cat.id}`,
        }))
      );
    } catch (error) {
      console.error("Home data error:", error);

      setHomeData({
        flash_sale: [],
        best_deal: [],
        trending: [],
      });

      setCategories([]);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const openLoginPopup = () => {
    window.dispatchEvent(
      new CustomEvent("openAuthPopup", {
        detail: {
          type: "login",
          message: "Login to continue",
        },
      })
    );
  };

  const requireLogin = (route) => {
    if (!user) {
      openLoginPopup();
      return;
    }

    navigate(route);
  };

  const goToProduct = (product) => {
    requireLogin(`/products/${product.id}`);
  };

  const goToShop = (shop) => {
    requireLogin(`/store/${shop.id}`);
  };

  const firstCategoryRoute =
    categories.length > 0 ? categories[0].route : "/category/1";

  const goToProductList = (type) => {
    if (type === "flash_sale") {
      requireLogin("/flash-sale");
      return;
    }

    if (type === "trending") {
      requireLogin("/trending");
      return;
    }

    if (type === "best_deal") {
      requireLogin("/best-deal");
      return;
    }

    requireLogin(firstCategoryRoute);
  };

  const flashSaleProducts = homeData.flash_sale || [];
  const bestDealProducts = homeData.best_deal || [];
  const trendingProducts = homeData.trending || [];

  const hasAnyProducts =
    flashSaleProducts.length > 0 ||
    bestDealProducts.length > 0 ||
    trendingProducts.length > 0;

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.topGrid}>
          <aside style={styles.categoryPanel}>
            <div style={styles.panelTitle}>☰ CATEGORY</div>

            {categories.length === 0 && !loading ? (
              <div style={styles.panelEmpty}>No categories found.</div>
            ) : (
              categories.map((cat, index) => (
                <button
                  key={cat.id || index}
                  type="button"
                  onClick={() => {
                    setActiveCategory(index);
                    requireLogin(cat.route);
                  }}
                  style={{
                    ...styles.categoryItem,
                    ...(activeCategory === index ? styles.activeCategoryItem : {}),
                  }}
                >
                  <span style={styles.categoryIcon}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))
            )}
          </aside>

          <HeroBanner onAction={goToProductList} />

          <aside style={styles.sidePanel}>
            <div style={styles.brandBox}>
              <div style={styles.panelTitle}>POPULAR BRANDS</div>

              <div style={styles.brandGrid}>
                {BRANDS.map((brand, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => requireLogin(`/brand/${brand.name.toLowerCase()}`)}
                    style={{
                      ...styles.brandItem,
                      background: brand.bg,
                    }}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => requireLogin("/flash-sale")}
              style={styles.flashMini}
            >
              <strong>🔥 FLASH SALE</strong>
              <span>Discount products</span>
            </button>
          </aside>
        </section>

        <section style={styles.section}>
          <SectionTitle title="Featured Stores" />

          {loading ? (
            <EmptyBox text="Loading shops..." />
          ) : shops.length === 0 ? (
            <EmptyBox text="No shops found." />
          ) : (
            <div style={styles.shopGrid}>
              {shops.slice(0, 4).map((shop, index) => (
                <ShopCard
                  key={shop.id || index}
                  shop={shop}
                  index={index}
                  onClick={goToShop}
                />
              ))}
            </div>
          )}
        </section>

        {!loading && shops.length > 4 && (
          <section style={styles.section}>
            <SectionTitle title="More Shops" />

            <div style={styles.partnerGrid}>
              {shops.slice(4, 7).map((shop, index) => (
                <PartnerShopCard
                  key={shop.id || index}
                  shop={shop}
                  index={index}
                  onClick={goToShop}
                />
              ))}
            </div>
          </section>
        )}

        <section style={styles.flashBanner}>
          <div>
            <div style={styles.bannerLabel}>LIMITED OFFER</div>
            <div style={styles.bannerTitle}>Flash Sale — Discount Products</div>
            <div style={styles.bannerText}>
              Products with discount set by shop owners
            </div>
          </div>

          <button
            type="button"
            onClick={() => requireLogin("/flash-sale")}
            style={styles.bannerButton}
          >
            Shop Flash Sale
          </button>
        </section>

        {loading ? (
          <EmptyBox text="Loading products..." />
        ) : !hasAnyProducts ? (
          <EmptyBox text="No products found." />
        ) : (
          <>
            <section style={styles.section}>
              <SectionTitle
                title="Flash Sale"
                onLink={() => requireLogin("/flash-sale")}
              />

              {flashSaleProducts.length === 0 ? (
                <EmptyBox text="No flash sale products yet." />
              ) : (
                <div style={styles.compactProductGrid}>
                  {flashSaleProducts.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      compact
                      onClick={goToProduct}
                    />
                  ))}
                </div>
              )}
            </section>

            <section style={styles.section}>
              <SectionTitle
                title="Best Deal"
                onLink={() => requireLogin("/best-deal")}
              />

              {bestDealProducts.length === 0 ? (
                <EmptyBox text="No newest products yet." />
              ) : (
                <div style={styles.productGrid}>
                  {bestDealProducts.slice(0, 10).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={goToProduct}
                    />
                  ))}
                </div>
              )}
            </section>

            <section style={styles.section}>
              <SectionTitle
                title="Trending Now"
                onLink={() => requireLogin("/trending")}
              />

              {trendingProducts.length === 0 ? (
                <EmptyBox text="No trending products yet." />
              ) : (
                <div style={styles.productGrid}>
                  {trendingProducts.slice(0, 10).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={goToProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <section style={styles.newArrivalBanner}>
          <div>
            <div style={styles.bannerLabel}>NEW ARRIVAL</div>
            <div style={styles.bannerTitle}>Discover New Products</div>
            <div style={styles.bannerText}>Newest products appear in Best Deal</div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (bestDealProducts.length > 0) {
                requireLogin(`/products/${bestDealProducts[0].id}`);
              } else {
                requireLogin(firstCategoryRoute);
              }
            }}
            style={styles.bannerButton}
          >
            Grab Deal
          </button>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    background: COLORS.bg,
    minHeight: "100vh",
  },
  main: {
    width: "100%",
    maxWidth: 1700,
    margin: "0 auto",
    padding: "clamp(14px, 2vw, 24px)",
    boxSizing: "border-box",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(170px, 210px) minmax(0, 1fr) minmax(160px, 190px)",
    gap: 14,
    marginBottom: 28,
  },
  categoryPanel: {
    background: COLORS.white,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    overflow: "hidden",
  },
  panelTitle: {
    padding: "10px 14px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: 11,
    fontWeight: 900,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  panelEmpty: {
    padding: 14,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  categoryItem: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    color: COLORS.text,
    border: "none",
    borderLeft: "3px solid transparent",
    textAlign: "left",
    transition: "all 0.15s",
  },
  activeCategoryItem: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    borderLeft: `3px solid ${COLORS.primary}`,
    fontWeight: 800,
  },
  categoryIcon: {
    fontSize: 15,
  },
  hero: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    minHeight: 230,
    display: "flex",
    alignItems: "center",
    padding: "clamp(24px, 4vw, 42px)",
    boxSizing: "border-box",
    transition: "background 0.6s",
  },
  heroContent: {
    zIndex: 1,
    flex: 1,
    maxWidth: 540,
  },
  heroBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
    padding: "5px 12px",
    borderRadius: 999,
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 900,
    margin: "0 0 8px",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 15,
    margin: "0 0 18px",
  },
  heroButton: {
    border: "none",
    padding: "11px 24px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  heroIcon: {
    position: "absolute",
    right: 28,
    bottom: -8,
    fontSize: 110,
    opacity: 0.12,
  },
  heroDots: {
    position: "absolute",
    bottom: 14,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 6,
  },
  heroDot: {
    height: 7,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  brandBox: {
    background: COLORS.white,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    paddingBottom: 10,
    flex: 1,
  },
  brandGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
    padding: 10,
  },
  brandItem: {
    borderRadius: 7,
    padding: "7px 2px",
    textAlign: "center",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 900,
    border: "none",
  },
  flashMini: {
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    borderRadius: 12,
    padding: 14,
    cursor: "pointer",
    color: COLORS.white,
    border: "none",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: COLORS.text,
    margin: 0,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.primaryDark,
    cursor: "pointer",
    fontWeight: 900,
    border: "none",
    background: "transparent",
  },
  shopGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 14,
  },
  partnerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 14,
  },
  shopCard: {
    background: COLORS.white,
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    padding: 16,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    transition: "all 0.2s",
  },
  shopLogo: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shopLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  shopText: {
    textAlign: "center",
  },
  shopName: {
    fontSize: 14,
    fontWeight: 900,
    color: COLORS.text,
  },
  verified: {
    color: COLORS.primary,
    fontSize: 12,
  },
  shopMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  visitButton: {
    background: COLORS.primaryLight,
    color: COLORS.primaryDark,
    border: "none",
    padding: "7px 16px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  partnerCard: {
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    padding: "16px 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  partnerLogo: {
    width: 52,
    height: 52,
    background: COLORS.white,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    overflow: "hidden",
    flexShrink: 0,
  },
  partnerText: {
    minWidth: 0,
  },
  partnerName: {
    fontWeight: 900,
    fontSize: 15,
    color: COLORS.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  partnerDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  partnerBrowse: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginTop: 5,
    fontWeight: 900,
  },
  flashBanner: {
    background: "linear-gradient(135deg,#15803d,#22c55e)",
    borderRadius: 16,
    padding: "clamp(18px, 3vw, 28px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 30,
    flexWrap: "wrap",
  },
  newArrivalBanner: {
    background: "linear-gradient(135deg,#166534,#0f766e)",
    borderRadius: 16,
    padding: "clamp(18px, 3vw, 28px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 30,
    flexWrap: "wrap",
  },
  bannerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: "clamp(21px, 3vw, 28px)",
    fontWeight: 900,
    margin: "5px 0",
  },
  bannerText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
  },
  bannerButton: {
    background: COLORS.white,
    color: COLORS.primaryDark,
    border: "none",
    padding: "11px 24px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 900,
    cursor: "pointer",
  },
  compactProductGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 145px), 1fr))",
    gap: 12,
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 210px), 1fr))",
    gap: 16,
  },
  productCard: {
    background: COLORS.white,
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: 0,
  },
  productImageBox: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: 10,
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 10,
  },
  discountBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    background: COLORS.primary,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 7px",
    borderRadius: 999,
  },
  productName: {
    color: COLORS.text,
    marginBottom: 6,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  finalPrice: {
    fontWeight: 900,
    color: COLORS.primaryDark,
  },
  oldPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecoration: "line-through",
  },
  productMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyBox: {
    background: COLORS.white,
    padding: 24,
    borderRadius: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    border: `1px solid ${COLORS.border}`,
    marginBottom: 12,
    fontWeight: 700,
  },
};