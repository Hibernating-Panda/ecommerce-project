import React from "react";
import { NavLink } from "react-router-dom";

function ShopOwnerSidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandBox}>
        <div style={styles.logo}>S</div>
        <div>
          <h2 style={styles.title}>Shop Panel</h2>
          <p style={styles.subtitle}>Owner Management</p>
        </div>
      </div>

      <nav>
        <NavLink to="/shop/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/shop/products" style={linkStyle}>
          Products
        </NavLink>

        <NavLink to="/shop/add-product" style={linkStyle}>
          Add Product
        </NavLink>

        <NavLink to="/shop/orders" style={linkStyle}>
          Orders
        </NavLink>

        <NavLink to="/shop/profile" style={linkStyle}>
          Shop Profile
        </NavLink>
      </nav>
    </aside>
  );
}

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "13px 15px",
  marginBottom: "8px",
  borderRadius: "12px",
  textDecoration: "none",
  color: isActive ? "#111827" : "#d1d5db",
  backgroundColor: isActive ? "#facc15" : "transparent",
  fontWeight: isActive ? "800" : "600",
});

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "linear-gradient(180deg, #111827, #1f2937)",
    padding: "24px",
    boxSizing: "border-box",
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "35px",
  },
  logo: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    backgroundColor: "#facc15",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "22px",
  },
  title: {
    color: "white",
    margin: 0,
    fontSize: "21px",
  },
  subtitle: {
    color: "#9ca3af",
    margin: "4px 0 0",
    fontSize: "13px",
  },
};

export default ShopOwnerSidebar;