import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const COLORS = {
  primary: "#E8192C",
  purple: "#534AB7",
  text: "#1a1a1a",
  textMuted: "#888",
  border: "#eee",
  white: "#fff",
};

const HERO_SLIDES = [
  {
    bg: "linear-gradient(135deg,#1428A0,#185FA5)",
    accent: "#E8192C",
    badge: "BEST DEAL",
    title: "Newest Products",
    subtitle: "Discover the latest items from real shops",
    cta: "Shop Now",
    target: "best_deal",
  },
  {
    bg: "linear-gradient(135deg,#E8192C,#FF6B35)",
    accent: "rgba(255,255,255,0.25)",
    badge: "FLASH SALE",
    title: "Discount Deals Today",
    subtitle: "Products with discounts from shop owners",
    cta: "Grab Deal",
    target: "flash_sale",
  },
  {
    bg: "linear-gradient(135deg,#0d7a3f,#1DB954)",
    accent: "#F6AD55",
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

  const discountPercent = Number(
    product?.discount_percent || product?.discount || 0
  );

  const discountPrice = Number(product?.discount_price || 0);

  if (discountPrice > 0 && discountPrice < price) {
    return {
      originalPrice: price,
      finalPrice: discountPrice,
      discount: Math.round(((price - discountPrice) / price) * 100),
    };
  }

  if (discountPercent > 0) {
    const finalPrice = price - price * (discountPercent / 100);

    return {
      originalPrice: price,
      finalPrice,
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
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return null;
  }

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
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        height: 210,
        background: slide.bg,
        transition: "background 0.6s",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
      }}
    >
      <div style={{ zIndex: 1, flex: 1 }}>
        <div
          style={{
            display: "inline-block",
            background: slide.accent,
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            padding: "3px 10px",
            borderRadius: 3,
            marginBottom: 8,
          }}
        >
          {slide.badge}
        </div>

        <h2
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: 900,
            margin: "0 0 6px",
          }}
        >
          {slide.title}
        </h2>

        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 13,
            margin: "0 0 16px",
          }}
        >
          {slide.subtitle}
        </p>

        <button
          onClick={() => onAction(slide.target)}
          style={{
            background: slide.accent,
            color: "#fff",
            border: "none",
            padding: "9px 22px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {slide.cta} →
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: 0,
          fontSize: 100,
          opacity: 0.1,
        }}
      >
        🛍️
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 5,
        }}
      >
        {HERO_SLIDES.map((_, index) => (
          <div
            key={index}
            onClick={() => setActive(index)}
            style={{
              width: index === active ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background:
                index === active ? "#fff" : "rgba(255,255,255,0.38)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, onLink }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
        {title}
      </h3>

      {onLink && (
        <span
          onClick={onLink}
          style={{
            fontSize: 12,
            color: COLORS.primary,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          See all →
        </span>
      )}
    </div>
  );
}

function ProductCard({ product, compact, onClick }) {
  const [hovered, setHovered] = useState(false);

  const imageUrl = getProductImage(product);
  const { originalPrice, finalPrice, discount } = getProductPrice(product);

  const rating = formatRating(product.average_rating);
  const reviewCount =
    product.reviews_count || product.product_reviews_count || 0;
  const sold = product.sold || product.total_sold || product.quantity_sold || 0;
  const hue = ((product.id || 1) * 37) % 360;

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.white,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: compact ? 8 : 10,
        cursor: "pointer",
        boxShadow: hovered
          ? "0 6px 18px rgba(232,25,44,0.14)"
          : "0 1px 2px rgba(0,0,0,0.02)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          background: `hsl(${hue},50%,94%)`,
          borderRadius: 6,
          marginBottom: compact ? 6 : 8,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 6,
          }}
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />

        {!compact && discount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              background: COLORS.primary,
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: 3,
            }}
          >
            -{discount}%
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: compact ? 10 : 11,
          color: compact ? COLORS.textMuted : COLORS.text,
          marginBottom: 4,
          overflow: "hidden",
          whiteSpace: compact ? "nowrap" : "normal",
          textOverflow: "ellipsis",
          display: compact ? "block" : "-webkit-box",
          WebkitLineClamp: compact ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          minHeight: compact ? "auto" : 30,
        }}
      >
        {product.name}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 3,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: compact ? 12 : 13,
            fontWeight: 700,
            color: COLORS.primary,
          }}
        >
          ${finalPrice.toFixed(2)}
        </span>

        {discount > 0 && (
          <span
            style={{
              fontSize: compact ? 9 : 10,
              color: COLORS.textMuted,
              textDecoration: "line-through",
            }}
          >
            ${originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      {!compact && (
        <div style={{ fontSize: 10, color: COLORS.textMuted }}>
          {reviewCount > 0 && rating ? (
            <>
              ⭐ {rating} · {reviewCount} review
              {reviewCount > 1 ? "s" : ""} · {Number(sold).toLocaleString()}{" "}
              sold
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
        background: COLORS.white,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: 14,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        boxShadow: hovered ? "0 4px 14px rgba(232,25,44,0.1)" : "none",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `hsl(${index * 70 + 180}, 50%, 90%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span style={{ fontSize: 24 }}>🏪</span>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
          {name}
          {verified && (
            <span style={{ marginLeft: 3, color: COLORS.purple, fontSize: 11 }}>
              ✓
            </span>
          )}
        </div>

        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
          {reviewCount > 0 && rating ? (
            <>
              ⭐ {rating} · {reviewCount} review
              {reviewCount > 1 ? "s" : ""} ·{" "}
              {Number(itemCount).toLocaleString()} items
            </>
          ) : (
            <>No reviews yet · {Number(itemCount).toLocaleString()} items</>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick(shop);
        }}
        style={{
          background: "#FFF0F1",
          color: COLORS.primary,
          border: "none",
          padding: "5px 14px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
        }}
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

  const bgColors = ["#fffaf0", "#f0f8ff", "#f0fff4", "#fff0f5"];

  return (
    <div
      onClick={() => onClick(shop)}
      style={{
        background: bgColors[index % bgColors.length],
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: "14px 18px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          background: COLORS.white,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: COLORS.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </div>

        <div
          style={{
            fontSize: 11,
            color: COLORS.primary,
            marginTop: 4,
            fontWeight: 600,
          }}
        >
          Browse →
        </div>
      </div>
    </div>
  );
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

      const realShops = Array.isArray(shopJson)
        ? shopJson
        : shopJson.data || [];

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
      console.error("HOME DATA ERROR:", error);

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
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: 1700, margin: "0 auto", padding: "14px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "190px 1fr 175px",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: COLORS.white,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "9px 14px",
                borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.textMuted,
                letterSpacing: 0.8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ☰ CATEGORY
            </div>

            {categories.length === 0 && !loading ? (
              <div
                style={{
                  padding: 14,
                  fontSize: 12,
                  color: COLORS.textMuted,
                }}
              >
                No categories found.
              </div>
            ) : (
              categories.map((cat, index) => (
                <div
                  key={cat.id || index}
                  onClick={() => {
                    setActiveCategory(index);
                    requireLogin(cat.route);
                  }}
                  style={{
                    padding: "9px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background:
                      activeCategory === index ? "#FFF0F1" : "transparent",
                    color:
                      activeCategory === index ? COLORS.primary : COLORS.text,
                    fontWeight: activeCategory === index ? 700 : 400,
                    borderLeft:
                      activeCategory === index
                        ? `3px solid ${COLORS.primary}`
                        : "3px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{cat.icon}</span>
                  {cat.label}
                </div>
              ))
            )}
          </div>

          <HeroBanner onAction={goToProductList} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                background: COLORS.white,
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                padding: 10,
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: COLORS.textMuted,
                  marginBottom: 8,
                  letterSpacing: 0.8,
                }}
              >
                POPULAR BRANDS
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 4,
                }}
              >
                {BRANDS.map((brand, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      requireLogin(`/brand/${brand.name.toLowerCase()}`)
                    }
                    style={{
                      background: brand.bg,
                      borderRadius: 5,
                      padding: "5px 2px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    >
                      {brand.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              onClick={() => requireLogin("/flash-sale")}
              style={{
                background: "linear-gradient(135deg, #E8192C, #FF6B35)",
                borderRadius: 8,
                padding: 12,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 2,
                }}
              >
                🔥 FLASH SALE
              </div>

              <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 10 }}>
                Discount products
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="Featured Stores" />

          {loading ? (
            <EmptyBox text="Loading shops..." />
          ) : shops.length === 0 ? (
            <EmptyBox text="No shops found." />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
              }}
            >
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
        </div>

        {!loading && shops.length > 4 && (
          <div style={{ marginBottom: 28 }}>
            <SectionTitle title="More Shops" />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {shops.slice(4, 7).map((shop, index) => (
                <PartnerShopCard
                  key={shop.id || index}
                  shop={shop}
                  index={index}
                  onClick={goToShop}
                />
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: "linear-gradient(135deg, #E8192C 0%, #FF6B35 100%)",
            borderRadius: 10,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              LIMITED OFFER
            </div>

            <div
              style={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                margin: "4px 0",
              }}
            >
              Flash Sale — Discount Products
            </div>

            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>
              Products with discount set by shop owners
            </div>
          </div>

          <button
            onClick={() => requireLogin("/flash-sale")}
            style={{
              background: "#fff",
              color: COLORS.primary,
              border: "none",
              padding: "10px 24px",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Shop Flash Sale
          </button>
        </div>

        {loading ? (
          <EmptyBox text="Loading products..." />
        ) : !hasAnyProducts ? (
          <EmptyBox text="No products found." />
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Flash Sale"
                onLink={() => requireLogin("/flash-sale")}
              />

              {flashSaleProducts.length === 0 ? (
                <EmptyBox text="No flash sale products yet." />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    gap: 10,
                  }}
                >
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
            </div>

            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Best Deal"
                onLink={() => requireLogin("/best-deal")}
              />

              {bestDealProducts.length === 0 ? (
                <EmptyBox text="No newest products yet." />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 14,
                  }}
                >
                  {bestDealProducts.slice(0, 10).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={goToProduct}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Trending Now"
                onLink={() => requireLogin("/trending")}
              />

              {trendingProducts.length === 0 ? (
                <EmptyBox text="No trending products yet." />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 14,
                  }}
                >
                  {trendingProducts.slice(0, 10).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={goToProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div
          style={{
            background: "linear-gradient(135deg, #1428A0 0%, #185FA5 100%)",
            borderRadius: 10,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              NEW ARRIVAL
            </div>

            <div
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 900,
                margin: "4px 0",
              }}
            >
              Discover New Products
            </div>

            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
              Newest products appear in Best Deal
            </div>
          </div>

          <button
            onClick={() => {
              if (bestDealProducts.length > 0) {
                requireLogin(`/products/${bestDealProducts[0].id}`);
              } else {
                requireLogin(firstCategoryRoute);
              }
            }}
            style={{
              background: "#F6AD55",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Grab Deal
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        color: COLORS.textMuted,
        textAlign: "center",
        border: `1px solid ${COLORS.border}`,
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
}