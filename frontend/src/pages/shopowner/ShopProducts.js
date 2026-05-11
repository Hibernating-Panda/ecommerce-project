import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import ConfirmPopup from "../../components/common/ConfirmPopup";


function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/shopowner/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Products error:", error);
        setPopup({
          show: true,
          type: "error",
          title: "Load Failed",
          message: "Failed to load products.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
    const newStatus = product.status === "Active" ? "Inactive" : "Active";

    try {
      const res = await api.put(`/shopowner/products/${product.id}`, {
        ...product,
        status: newStatus,
      });

      setProducts(
        products.map((item) =>
          item.id === product.id ? res.data.product : item
        )
      );
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update product status.");
    }
  };

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showPopup = (type, title, message) => {
    setPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const [deleteId, setDeleteId] = useState(null);


  if (loading) {
    return <p style={styles.loading}>Loading products...</p>;
  }

  return (
    <div>
    <PopupMessage
      show={popup.show}
      type={popup.type}
      title={popup.title}
      message={popup.message}
      onClose={() =>
        setPopup({
          show: false,
          type: "success",
          title: "",
          message: "",
        })
      }
    />

    <ConfirmPopup
      show={deleteId !== null}
      title="Delete Product"
      message="Are you sure you want to delete this product? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      onCancel={() => setDeleteId(null)}
      onConfirm={() => confirmDeleteProduct()}
    />
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.desc}>Manage products in your shop.</p>
        </div>

        <Link to="/shop/add-product" style={styles.addBtn}>
          + Add Product
        </Link>
      </div>

      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            <img
              src={
                product.image ||
                "https://via.placeholder.com/500x350?text=No+Image"
              }
              alt={product.name}
              style={styles.image}
            />

            <div style={styles.body}>
              <div style={styles.topRow}>
                <h3 style={styles.name}>{product.name}</h3>
                <span style={getProductStatusStyle(product.status)}>
                  {product.status}
                </span>
              </div>

              <p style={styles.category}>
                {product.category?.name || "No Category"}
              </p>
              <p style={styles.description}>{product.description}</p>

              <div style={styles.infoRow}>
                <strong>${product.price}</strong>
                <span>Stock: {product.stock}</span>
              </div>

              <div style={styles.actions}>
                <Link
                  to={`/shop/add-product?id=${product.id}`}
                  style={styles.editBtn}
                >
                  Edit
                </Link>

                <button
                  onClick={() => toggleStatus(product)}
                  style={styles.statusBtn}
                >
                  {product.status === "Active" ? "Disable" : "Enable"}
                </button>

                <button
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
    </div>
  );
}

const getProductStatusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  backgroundColor: status === "Active" ? "#dcfce7" : "#fee2e2",
  color: status === "Active" ? "#166534" : "#991b1b",
});

const styles = {
  loading: {
    fontSize: "18px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
  },
  addBtn: {
    backgroundColor: "#111827",
    color: "white",
    padding: "12px 18px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "800",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "22px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
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
  },
  name: {
    margin: 0,
    color: "#111827",
  },
  category: {
    color: "#6b7280",
    margin: "8px 0",
  },
  description: {
    color: "#4b5563",
    minHeight: "44px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "14px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  editBtn: {
    backgroundColor: "#2563eb",
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
  },
};

export default ShopProducts;