import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import img_WirelessEarbud from "../image/Wireless_Earbud.png";
import img_SmartWatch from "../image/Smart_Watch.png";
import img_RunningShoes from "../image/Running_Shoses.png";
import img_LaptopStand from "../image/Laptop_Stand.png";
import img_PhoneCase from "../image/Phone_Case.png";
import img_SunGlasses from "../image/SunGlasses.png";
import img_YogaMat from "../image/Yoga_Mat.png";
import img_CoffeeMaker from "../image/Coffee_Maker.png";
import img_Backpack from "../image/Backpack.png";
import img_DeskLamp from "../image/Desk_Lamp.png";
import img_Keyboard from "../image/Keyboard.png";
import img_MousePad from "../image/Mouse_Pad.png";
import img_WaterBottle from "../image/Water_Bottle.png";
import img_Hoodie from "../image/Hoddie.png";
import img_Sneakers from "../image/Sneakers.png";
import img_TabletCover from "../image/Table_Cover.png";
import img_CableOrganizer from "../image/Table_Orgainzer.png";
import img_Wallet from "../image/Wallet.png";
import img_Belt from "../image/Belt.png";
import img_Cap from "../image/Cap.png";
import img_UsbHub from "../image/Usb_Hub.png";
import img_Webcam from "../image/Webcam.png";
import img_DeskChair from "../image/Desk_Chair.png";
import img_Monitor from "../image/Monitor.png";
import img_Headphone from "../image/Headphone.png";
import img_Speaker from "../image/Speaker.png";
import img_PowerBank from "../image/Power_bank.png";
import img_CameraLens from "../image/Camera_Lens.png";

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
    badge: "NEW ARRIVAL",
    title: "Samsung Galaxy S25",
    subtitle: "Experience the future in your hands",
    cta: "Shop Now",
  },
  {
    bg: "linear-gradient(135deg,#E8192C,#FF6B35)",
    accent: "rgba(255,255,255,0.25)",
    badge: "FLASH SALE",
    title: "Up to 50% Off Today",
    subtitle: "Electronics, Fashion & more on sale",
    cta: "Grab Deal",
  },
  {
    bg: "linear-gradient(135deg,#0d7a3f,#1DB954)",
    accent: "#F6AD55",
    badge: "TRENDING",
    title: "Nike Air Max 2025",
    subtitle: "New colorways just dropped",
    cta: "View Collection",
  },
];

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

const QUICK_CATS = [
  { icon: "📱", label: "Phones",    route: "/category/phones" },
  { icon: "👟", label: "Shoes",     route: "/category/fashion" },
  { icon: "💄", label: "Beauty",    route: "/category/health-beauty" },
  { icon: "🏡", label: "Home",      route: "/category/home-living" },
  { icon: "⌚", label: "Watches",   route: "/category/phones" },
  { icon: "🎒", label: "Bags",      route: "/category/fashion" },
  { icon: "🖥️", label: "Computers", route: "/category/computers" },
  { icon: "📷", label: "Cameras",   route: "/category/phones" },
  { icon: "🎧", label: "Audio",     route: "/category/phones" },
  { icon: "🍳", label: "Kitchen",   route: "/category/home-living" },
];

const BRANDS = [
  { name: "Samsung", bg: "#1428A0" },
  { name: "Apple", bg: "#555" },
  { name: "Nike", bg: "#111" },
  { name: "Adidas", bg: "#222" },
  { name: "Sony", bg: "#333" },
  { name: "LG", bg: "#A50034" },
];

const FEATURED_STORES = [
  { logo: "🏪", name: "TechHub", verified: true, rating: 4.8, items: 12400 },
  { logo: "👗", name: "FashionCo", verified: true, rating: 4.7, items: 8200 },
  { logo: "🏠", name: "HomeWorld", verified: false, rating: 4.5, items: 5600 },
  { logo: "⚽", name: "SportZone", verified: true, rating: 4.9, items: 3400 },
];

const PARTNER_STORES = [
  { logo: "📦", name: "JumiaExpress", discount: "Free shipping over $30", color: "#fffaf0" },
  { logo: "🛒", name: "Konga Mall", discount: "Up to 40% off electronics", color: "#f0f8ff" },
  { logo: "💳", name: "PayMall", discount: "Pay later, 0% interest", color: "#f0fff4" },
];

// ─── Product Images mapped to your /src/image/ folder ────────────────────────
const PRODUCT_IMAGES = [
  img_WirelessEarbud,
  img_SmartWatch,
  img_RunningShoes,
  img_LaptopStand,
  img_PhoneCase,
  img_SunGlasses,
  img_YogaMat,
  img_CoffeeMaker,
  img_Backpack,
  img_DeskLamp,
  img_Keyboard,
  img_MousePad,
  img_WaterBottle,
  img_Hoodie,
  img_Sneakers,
  img_TabletCover,
  img_CableOrganizer,
  img_Wallet,
  img_Belt,
  img_Cap,
  img_UsbHub,
  img_Webcam,
  img_DeskChair,
  img_Monitor,
  img_Headphone,
  img_Speaker,
  img_PowerBank,
  img_CameraLens,
  img_CameraLens,  // Tripod placeholder
  img_Keyboard,    // Flash Drive placeholder
];

const PRODUCT_NAMES = [
  "Wireless Earbuds","Smart Watch","Running Shoes","Laptop Stand","Phone Case",
  "Sunglasses","Yoga Mat","Coffee Maker","Backpack","Desk Lamp",
  "Keyboard","Mouse Pad","Water Bottle","Hoodie","Sneakers",
  "Tablet Cover","Cable Organizer","Wallet","Belt","Cap",
  "USB Hub","Webcam","Desk Chair","Monitor","Headphones",
  "Speaker","Power Bank","Camera Lens","Tripod","Flash Drive"
];

const ALL_PRODUCTS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: PRODUCT_NAMES[i] || `Product ${i + 1}`,
  price: (Math.random() * 200 + 10).toFixed(2),
  originalPrice: (Math.random() * 300 + 50).toFixed(2),
  rating: (3.5 + Math.random() * 1.5).toFixed(1),
  sold: Math.floor(Math.random() * 5000) + 100,
  img: PRODUCT_IMAGES[i],
}));

// ─── Sub-Components ───────────────────────────────────────────────────────────

function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % HERO_SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[active];

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", position: "relative", height: 210, background: slide.bg, transition: "background 0.6s", display: "flex", alignItems: "center", padding: "0 32px" }}>
      <div style={{ zIndex: 1, flex: 1 }}>
        <div style={{ display: "inline-block", background: slide.accent, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 3, marginBottom: 8 }}>
          {slide.badge}
        </div>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 6px", lineHeight: 1.2 }}>{slide.title}</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "0 0 16px" }}>{slide.subtitle}</p>
        <button style={{ background: slide.accent, color: "#fff", border: "none", padding: "9px 22px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {slide.cta} →
        </button>
      </div>
      <div style={{ position: "absolute", right: 20, bottom: 0, fontSize: 100, opacity: 0.1 }}>📱</div>
      <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
        {HERO_SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? "#fff" : "rgba(255,255,255,0.38)", cursor: "pointer", transition: "all 0.3s" }}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, onLink }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{title}</h3>
      {onLink && (
        <span onClick={onLink} style={{ fontSize: 12, color: COLORS.primary, cursor: "pointer", fontWeight: 600 }}>
          See all →
        </span>
      )}
    </div>
  );
}

function ProductCard({ product, compact, onClick }) {
  const [hovered, setHovered] = useState(false);
  const disc = Math.round((1 - product.price / product.originalPrice) * 100);
  const hue = (product.id * 37) % 360;

  if (compact) {
    return (
      <div
        onClick={() => onClick && onClick(product)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 8, cursor: "pointer", boxShadow: hovered ? "0 2px 10px rgba(0,0,0,0.08)" : "none", transition: "box-shadow 0.2s" }}
      >
        <div style={{ width: "100%", aspectRatio: "1", background: `hsl(${hue},50%,94%)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, overflow: "hidden" }}>
          <img
            src={product.img}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{product.name}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary }}>${product.price}</div>
        <div style={{ fontSize: 9, color: COLORS.textMuted, textDecoration: "line-through" }}>${product.originalPrice}</div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick && onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 10, cursor: "pointer", boxShadow: hovered ? "0 2px 10px rgba(0,0,0,0.08)" : "none", transition: "box-shadow 0.2s" }}
    >
      <div style={{ width: "100%", aspectRatio: "1", background: `hsl(${hue},50%,94%)`, borderRadius: 6, marginBottom: 8, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={product.img}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <span style={{ position: "absolute", top: 5, left: 5, background: COLORS.primary, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3 }}>
          -{disc}%
        </span>
      </div>
      <div style={{ fontSize: 11, color: COLORS.text, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{product.name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary }}>${product.price}</span>
        <span style={{ fontSize: 10, color: COLORS.textMuted, textDecoration: "line-through" }}>${product.originalPrice}</span>
      </div>
      <div style={{ fontSize: 10, color: COLORS.textMuted }}>⭐ {product.rating} · {product.sold.toLocaleString()} sold</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>

      {/* Navbar */}
      <Navbar />

      <div style={{ maxWidth: 1700, margin: "0 auto", padding: "14px 20px" }}>

        {/* Above the fold: sidebar + hero + brands */}
        <div style={{ display: "grid", gridTemplateColumns: "190px 1fr 175px", gap: 12, marginBottom: 14 }}>

          {/* Sidebar */}
          <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, fontWeight: 800, color: COLORS.textMuted, letterSpacing: 0.8, display: "flex", alignItems: "center", gap: 6 }}>
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

          {/* Hero Banner */}
          <HeroBanner />

          {/* Brands + Flash */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 10, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 0.8 }}>POPULAR BRANDS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                {BRANDS.map((b, i) => (
                  <div key={i} style={{ background: b.bg, borderRadius: 5, padding: "5px 2px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #E8192C, #FF6B35)", borderRadius: 8, padding: 12, cursor: "pointer" }}>
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 800, marginBottom: 2 }}>🔥 FLASH SALE</div>
              <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 10 }}>Ends in 02:45:12</div>
            </div>
          </div>
        </div>

        {/* Quick Categories */}
        <div style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: "12px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {QUICK_CATS.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(cat.route)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF0F1")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", padding: "5px 14px", minWidth: 76, borderRadius: 8 }}
              >
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `hsl(${i * 36}, 55%, 92%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 11, color: COLORS.text, fontWeight: 500, whiteSpace: "nowrap" }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Stores */}
        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="Featured Stores" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {FEATURED_STORES.map((store, i) => (
              <div
                key={i}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(232,25,44,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                style={{ background: COLORS.white, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: 14, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `hsl(${i * 70 + 180}, 50%, 90%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {store.logo}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                    {store.name}
                    {store.verified && <span style={{ marginLeft: 3, color: COLORS.purple, fontSize: 11 }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    ⭐ {store.rating} · {store.items.toLocaleString()} items
                  </div>
                </div>
                <button style={{ background: "#FFF0F1", color: COLORS.primary, border: "none", padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  Visit Store
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Stores */}
        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="Partner Stores" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {PARTNER_STORES.map((store, i) => (
              <div key={i} style={{ background: store.color, borderRadius: 8, border: `1px solid ${COLORS.border}`, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, background: COLORS.white, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
                  {store.logo}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{store.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{store.discount}</div>
                  <div style={{ fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: 600 }}>Browse →</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Banner 1 */}
        <div style={{ background: "linear-gradient(135deg, #E8192C 0%, #FF6B35 100%)", borderRadius: 10, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>LIMITED OFFER</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "4px 0" }}>Flash Sale — Up to 50% Off</div>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>Electronics, Fashion, Home Essentials & more</div>
          </div>
          <button style={{ background: "#fff", color: COLORS.primary, border: "none", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Shop Flash Sale
          </button>
        </div>

        {/* Recommended */}
        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="You Might Want to Buy" onLink={() => navigate("/category/phones")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
            {ALL_PRODUCTS.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </div>

        {/* Trending */}
        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="Trending Now" onLink={() => navigate("/category/phones")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {ALL_PRODUCTS.slice(8, 18).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Promo Banner 2 */}
        <div style={{ background: "linear-gradient(135deg, #1428A0 0%, #185FA5 100%)", borderRadius: 10, padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, letterSpacing: 1.2 }}>NEW ARRIVAL</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: "4px 0" }}>Samsung Galaxy S25 Ultra</div>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>Starting from $899 · Official Store</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[["48", "HRS"], ["23", "MIN"], ["07", "SEC"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", padding: "8px 14px", borderRadius: 8 }}>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 900 }}>{n}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}>{l}</div>
              </div>
            ))}
          </div>
          <button style={{ background: "#F6AD55", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Grab Deal
          </button>
        </div>

        {/* More Products */}
        <div style={{ marginBottom: 28 }}>
          <SectionTitle title="More Products" onLink={() => navigate("/category/phones")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {ALL_PRODUCTS.slice(18, 28).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}