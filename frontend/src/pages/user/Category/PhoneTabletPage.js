import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";

// ─── Phone & Tablet Images Only ───────────────────────────────────────────────
import img_iPhone14    from "../../../image/iPhone14.png";
import img_iPhone15    from "../../../image/iPhone15.png";
import img_iPhone15P   from "../../../image/iPhone15P.png";
import img_iPhone16    from "../../../image/iPhone16.png";
import img_iPhone16PM  from "../../../image/iPhone16PM.png";
import img_iPhone17E   from "../../../image/iPhone17E.png";
import img_iPhone17PM  from "../../../image/iPhone17PM.png";
import img_iPhoneAir   from "../../../image/iPhoneAir.png";
import img_iPadM1      from "../../../image/iPadM1.png";
import img_iPadM2      from "../../../image/iPadM2.png";
import img_iPadM4      from "../../../image/iPadM4.png";
import img_iPadMini    from "../../../image/iPadMini.png";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#E8192C",
  purple: "#534AB7",
  text: "#1a1a1a",
  textMuted: "#888",
  border: "#eee",
  white: "#fff",
};

const SIDEBAR_CATEGORIES = [
  { icon: "📱", label: "Phones & Tablets",  route: "/category/phones" },
  { icon: "💻", label: "Computers",         route: "/category/computers" },
  { icon: "👗", label: "Fashion",           route: "/category/fashion" },
  { icon: "🏠", label: "Home & Living",     route: "/category/home-living" },
  { icon: "⚽", label: "Sports",            route: "/category/sports" },
  { icon: "💊", label: "Health & Beauty",   route: "/category/health-beauty" },
  { icon: "🎮", label: "Gaming",            route: "/category/gaming" },
  { icon: "📚", label: "Books",             route: "/category/books" },
  { icon: "🚗", label: "Automotive",        route: "/category/automotive" },
  { icon: "🌱", label: "Garden",            route: "/category/garden" },
];

const SORT_OPTIONS = ["Most Popular", "Newest", "Price: Low to High", "Price: High to Low", "Top Rated"];

// ─── Phone & Tablet Products ──────────────────────────────────────────────────
const PRODUCT_DATA = [
  { id: 1,  name: "iPhone 14",          price: 699.99,  originalPrice: 799.99,  rating: 4.6, sold: 3200, img: img_iPhone14 },
  { id: 2,  name: "iPhone 15",          price: 799.99,  originalPrice: 899.99,  rating: 4.7, sold: 2800, img: img_iPhone15 },
  { id: 3,  name: "iPhone 15 Pro",      price: 999.99,  originalPrice: 1099.99, rating: 4.8, sold: 2100, img: img_iPhone15P },
  { id: 4,  name: "iPhone 16",          price: 899.99,  originalPrice: 999.99,  rating: 4.7, sold: 1900, img: img_iPhone16 },
  { id: 5,  name: "iPhone 16 Pro Max",  price: 1199.99, originalPrice: 1299.99, rating: 4.9, sold: 1500, img: img_iPhone16PM },
  { id: 6,  name: "iPhone 17e",         price: 599.99,  originalPrice: 699.99,  rating: 4.5, sold: 980,  img: img_iPhone17E },
  { id: 7,  name: "iPhone 17 Pro Max",  price: 1299.99, originalPrice: 1399.99, rating: 4.9, sold: 760,  img: img_iPhone17PM },
  { id: 8,  name: "iPhone Air",         price: 899.99,  originalPrice: 999.99,  rating: 4.8, sold: 640,  img: img_iPhoneAir },
  { id: 9,  name: "iPad M1",            price: 799.99,  originalPrice: 899.99,  rating: 4.7, sold: 1100, img: img_iPadM1 },
  { id: 10, name: "iPad M2",            price: 899.99,  originalPrice: 999.99,  rating: 4.8, sold: 870,  img: img_iPadM2 },
  { id: 11, name: "iPad M4",            price: 1099.99, originalPrice: 1199.99, rating: 4.9, sold: 540,  img: img_iPadM4 },
  { id: 12, name: "iPad Mini",          price: 499.99,  originalPrice: 599.99,  rating: 4.6, sold: 1300, img: img_iPadMini },
];

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  const disc = Math.round((1 - product.price / product.originalPrice) * 100);
  const hue = (product.id * 37) % 360;

  return (
    <div
      onClick={() => onClick && onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.white,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        padding: 10,
        cursor: "pointer",
        boxShadow: hovered ? "0 4px 14px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "1", background: `hsl(${hue},50%,94%)`, borderRadius: 6, marginBottom: 8, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={product.img}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <span style={{ position: "absolute", top: 6, left: 6, background: COLORS.primary, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>
          -{disc}%
        </span>
        {product.sold > 2000 && (
          <span style={{ position: "absolute", top: 6, right: 6, background: "#FF6B35", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>
            HOT
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ fontSize: 12, color: COLORS.text, marginBottom: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4, minHeight: 33 }}>
        {product.name}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.primary }}>${product.price.toFixed(2)}</span>
        <span style={{ fontSize: 10, color: COLORS.textMuted, textDecoration: "line-through" }}>${product.originalPrice.toFixed(2)}</span>
      </div>

      <div style={{ fontSize: 10, color: COLORS.textMuted }}>
        ⭐ {product.rating} · {product.sold.toLocaleString()} sold
      </div>

      <button
        style={{ marginTop: 8, width: "100%", background: hovered ? COLORS.primary : "#FFF0F1", color: hovered ? "#fff" : COLORS.primary, border: "none", padding: "7px 0", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
      >
        Add to Cart
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PhoneTabletPage() {
  const [activeCategory, setActiveCategory] = useState(0); // 0 = Phones & Tablets
  const [sortBy, setSortBy] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [viewMode, setViewMode] = useState("grid");
  const [minRating, setMinRating] = useState(0);
  const navigate = useNavigate();

  // Filter & sort
  let products = [...PRODUCT_DATA];
  if (inStockOnly) products = products.filter((p) => p.sold > 0);
  products = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
  if (minRating > 0) products = products.filter((p) => p.rating >= minRating);

  if (sortBy === 1) products.sort((a, b) => b.id - a.id);
  else if (sortBy === 2) products.sort((a, b) => a.price - b.price);
  else if (sortBy === 3) products.sort((a, b) => b.price - a.price);
  else if (sortBy === 4) products.sort((a, b) => b.rating - a.rating);
  else products.sort((a, b) => b.sold - a.sold);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: 1700, margin: "0 auto", padding: "14px 20px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span onClick={() => navigate("/home")} style={{ cursor: "pointer", color: COLORS.primary }}>Home</span>
          <span>›</span>
          <span style={{ color: COLORS.text, fontWeight: 600 }}>📱 Phones & Tablets</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 12 }}>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Categories */}
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, fontWeight: 800, color: COLORS.textMuted, letterSpacing: 0.8 }}>
                ☰ CATEGORY
              </div>
              {SIDEBAR_CATEGORIES.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => { setActiveCategory(i); navigate(cat.route); }}
                  style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: activeCategory === i ? "#FFF0F1" : "transparent", color: activeCategory === i ? COLORS.primary : COLORS.text, fontWeight: activeCategory === i ? 700 : 400, borderLeft: activeCategory === i ? `3px solid ${COLORS.primary}` : "3px solid transparent", transition: "all 0.15s" }}
                >
                  <span style={{ fontSize: 14 }}>{cat.icon}</span>
                  {cat.label}
                </div>
              ))}
            </div>

            {/* Price Filter — updated range for phones */}
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 12 }}>PRICE RANGE</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                {[[0, 500], [500, 800], [800, 1100], [1100, 1500]].map(([min, max]) => (
                  <div
                    key={min}
                    onClick={() => setPriceRange([min, max])}
                    style={{ flex: 1, padding: "5px 2px", borderRadius: 5, border: `1px solid ${priceRange[0] === min && priceRange[1] === max ? COLORS.primary : COLORS.border}`, textAlign: "center", cursor: "pointer", fontSize: 9, fontWeight: 600, color: priceRange[0] === min && priceRange[1] === max ? COLORS.primary : COLORS.textMuted, background: priceRange[0] === min && priceRange[1] === max ? "#FFF0F1" : "transparent" }}
                  >
                    ${min}-{max}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                Selected: <strong style={{ color: COLORS.text }}>${priceRange[0]} – ${priceRange[1]}</strong>
              </div>
            </div>

            {/* Rating Filter */}
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 10 }}>MIN RATING</div>
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <div
                  key={r}
                  onClick={() => setMinRating(r)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", cursor: "pointer", color: minRating === r ? COLORS.primary : COLORS.text, fontWeight: minRating === r ? 700 : 400, fontSize: 12 }}
                >
                  <span style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${minRating === r ? COLORS.primary : COLORS.border}`, background: minRating === r ? COLORS.primary : "transparent", display: "inline-block" }} />
                  {r === 0 ? "All Ratings" : `${r}★ & above`}
                </div>
              ))}
            </div>

            {/* In Stock Toggle */}
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>In Stock Only</span>
              <div
                onClick={() => setInStockOnly(!inStockOnly)}
                style={{ width: 36, height: 20, borderRadius: 10, background: inStockOnly ? COLORS.primary : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
              >
                <div style={{ position: "absolute", top: 2, left: inStockOnly ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div>

            {/* Top bar */}
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>📱 Phones & Tablets</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>({products.length} items)</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>Sort:</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {SORT_OPTIONS.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => setSortBy(i)}
                        style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: sortBy === i ? 700 : 400, background: sortBy === i ? COLORS.primary : "transparent", color: sortBy === i ? "#fff" : COLORS.textMuted, cursor: "pointer", border: `1px solid ${sortBy === i ? COLORS.primary : COLORS.border}`, transition: "all 0.15s" }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 3 }}>
                  {["grid", "list"].map((mode) => (
                    <div
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: `1px solid ${viewMode === mode ? COLORS.primary : COLORS.border}`, background: viewMode === mode ? "#FFF0F1" : "transparent", cursor: "pointer", fontSize: 14, color: viewMode === mode ? COLORS.primary : COLORS.textMuted }}
                    >
                      {mode === "grid" ? "⊞" : "☰"}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {products.map((p) => {
                  const disc = Math.round((1 - p.price / p.originalPrice) * 100);
                  const hue = (p.id * 37) % 360;
                  return (
                    <div
                      key={p.id}
                      style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 12, display: "flex", gap: 14, cursor: "pointer", alignItems: "center" }}
                    >
                      <div style={{ width: 80, height: 80, background: `hsl(${hue},50%,94%)`, borderRadius: 6, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>⭐ {p.rating} · {p.sold.toLocaleString()} sold</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.primary }}>${p.price.toFixed(2)}</span>
                          <span style={{ fontSize: 11, color: COLORS.textMuted, textDecoration: "line-through" }}>${p.originalPrice.toFixed(2)}</span>
                          <span style={{ background: COLORS.primary, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>-{disc}%</span>
                        </div>
                      </div>
                      <button style={{ background: "#FFF0F1", color: COLORS.primary, border: "none", padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {products.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textMuted }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>No products match your filters</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting the price range or rating filter</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}