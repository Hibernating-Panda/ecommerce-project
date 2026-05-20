import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import ConfirmPopup from "../../components/common/ConfirmPopup";
import { roleThemes } from "../../theme/roleThemes";

function ShopProducts() {
  const theme = roleThemes.shop_owner;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shopowner/products");

      setProducts(Array.isArray(res.data) ? res.data : res.data.data || []);
      setPagination(res.data?.meta || null);
    } catch (error) {
      console.error("Products error:", error);
      showPopup("error", "Load Failed", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteProduct = async () => {
    try {
      await api.delete(`/shopowner/products/${deleteId}`);

      setProducts(products.filter((product) => product.id !== deleteId));
      setDeleteId(null);
      showPopup("success", "Product Deleted", "Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);
      setDeleteId(null);
      showPopup("error", "Delete Failed", "Failed to delete product.");
    }
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";

    try {
      const payload = {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        category_id: product.category_id || null,
        image: product.image || null,
        description: product.description || null,
        status: newStatus,
        discount_percent: Number(product.discount_percent || 0),
        discount_start: product.discount_start || null,
        discount_end: product.discount_end || null,
        sizes: product.sizes || [],
      };

      const res = await api.put(`/shopowner/products/${product.id}`, payload);

      setProducts(
        products.map((item) =>
          item.id === product.id ? res.data.product : item
        )
      );

      showPopup("success", "Status Updated", "Product status updated.");
    } catch (error) {
      console.error("Update status error:", error);
      showPopup("error", "Update Failed", "Failed to update product status.");
    }
  };

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  if (loading) {
    return <p style={styles.loading}>Loading products...</p>;
  }

  return (
    <div style={styles.page}>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      <ConfirmPopup
        show={deleteId !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDeleteProduct}
      />

      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.desc}>Manage products in your shop.</p>
        </div>

        <Link
          to="/shopowner/add-product"
          style={{ ...styles.addBtn, backgroundColor: theme.primary }}
        >
          + Add Product
        </Link>
      </div>

      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            <img
              src={getProductImage(product)}
              alt={product.name}
              style={styles.image}
            />

            <div style={styles.body}>
              <div style={styles.topRow}>
                <h3 style={styles.name}>{product.name}</h3>
                <span style={getProductStatusStyle(product.status)}>
                  {formatStatus(product.status)}
                </span>
              </div>

              <p style={styles.category}>
                {product.category?.name || "No Category"}
              </p>

              <p style={styles.description}>
                {product.description || "No description."}
              </p>

              <div style={styles.infoRow}>
                <strong>${Number(product.price || 0).toFixed(2)}</strong>
                <span>Stock: {product.stock}</span>
              </div>

              <div style={styles.actions}>
                <Link
                  to={`/shopowner/add-product?id=${product.id}`}
                  style={{ ...styles.editBtn, backgroundColor: theme.primary }}
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => toggleStatus(product)}
                  style={styles.statusBtn}
                >
                  {product.status === "active" ? "Disable" : "Enable"}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteId(product.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={styles.empty}>
          <h3>No products found</h3>
          <p>Add your first product to start selling.</p>
        </div>
      )}

      {pagination && (
        <p style={styles.pagination}>
          Showing {products.length} products
        </p>
      )}
    </div>
  );
}

const getProductImage = (product) => {
  return (
    product.image_url ||
    product.image ||
    "https://via.placeholder.com/500x350?text=No+Image"
  );
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getProductStatusStyle = (status) => {
  const active = status === "active";

  return {
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    backgroundColor: active ? "#dcfce7" : "#fee2e2",
    color: active ? "#166534" : "#991b1b",
    whiteSpace: "nowrap",
  };
};

const styles = {
  page: {
    width: "100%",
    maxWidth: "1440px",
  },
  loading: {
    fontSize: "18px",
    fontWeight: "700",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginTop: "8px",
  },
  addBtn: {
    color: "white",
    padding: "12px 18px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "800",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
    gap: "22px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
    minWidth: 0,
  },
  image: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    backgroundColor: "#e5e7eb",
  },
  body: {
    padding: "18px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },
  name: {
    margin: 0,
    color: "#111827",
    minWidth: 0,
  },
  category: {
    color: "#6b7280",
    margin: "8px 0",
    fontWeight: "700",
  },
  description: {
    color: "#4b5563",
    minHeight: "44px",
    overflow: "hidden",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  editBtn: {
    color: "white",
    padding: "9px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "800",
  },
  statusBtn: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "9px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "800",
  },
  empty: {
    backgroundColor: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
  },
  pagination: {
    marginTop: "18px",
    color: "#6b7280",
    fontWeight: "700",
  },
};

export default ShopProducts;