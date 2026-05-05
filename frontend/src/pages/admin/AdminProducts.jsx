import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    status: "active",
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      setCategories(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/products");
      setProducts(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);

    setFormData({
      category_id: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      image: "",
      status: "active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createProduct = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.post("/admin/products", {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      setMessage("Product created successfully.");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      category_id: product.category_id || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      image: product.image || "",
      status: product.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put(`/admin/products/${editingProduct.id}`, {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      setMessage("Product updated successfully.");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setMessage("");
      setError("");

      await api.patch(`/admin/products/${id}/status`, { status });

      setMessage("Product status updated successfully.");
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to update product status.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      setMessage("");
      setError("");

      await api.delete(`/admin/products/${id}`);

      setMessage("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete product.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Products</h1>
          <p style={styles.subtitle}>
            Create, edit, update status, and remove products from the store.
          </p>
        </div>

        <button onClick={fetchProducts} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <div>
            <h2 style={styles.formTitle}>
              {editingProduct ? "Edit Product" : "Create New Product"}
            </h2>
            <p style={styles.formSubtitle}>
              For now, use image URL. Later we can replace this with Cloudinary upload.
            </p>
          </div>

          {editingProduct && (
            <button onClick={resetForm} style={styles.cancelButton}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={editingProduct ? updateProduct : createProduct}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Example: Wireless Headphones"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price</label>
              <input
                type="number"
                name="price"
                placeholder="Example: 29.99"
                value={formData.price}
                onChange={handleChange}
                style={styles.input}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Stock</label>
              <input
                type="number"
                name="stock"
                placeholder="Example: 100"
                value={formData.stock}
                onChange={handleChange}
                style={styles.input}
                min="0"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Image URL</label>
              <input
                type="text"
                name="image"
                placeholder="https://example.com/product-image.jpg"
                value={formData.image}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Write product description..."
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                rows="4"
              />
            </div>
          </div>

          {formData.image && (
            <div style={styles.previewBox}>
              <p style={styles.previewTitle}>Image Preview</p>
              <img
                src={formData.image}
                alt="Product preview"
                style={styles.previewImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <button type="submit" disabled={saving} style={styles.submitButton}>
            {saving
              ? "Saving..."
              : editingProduct
              ? "Update Product"
              : "Create Product"}
          </button>
        </form>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>Product List</h2>
            <p style={styles.tableSubtitle}>
              Total products: {products.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={styles.emptyBox}>No products found.</div>
        ) : (
          <div style={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.imageBox}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={styles.productImage}
                    />
                  ) : (
                    <div style={styles.noImage}>No Image</div>
                  )}
                </div>

                <div style={styles.productBody}>
                  <div style={styles.productTop}>
                    <div>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <p style={styles.productId}>Product ID: #{product.id}</p>
                      <p style={styles.productId}>
                        Category: {product.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <span style={getStatusBadgeStyle(product.status)}>
                      {product.status || "active"}
                    </span>
                  </div>

                  <p style={styles.description}>
                    {product.description
                      ? product.description
                      : "No description provided."}
                  </p>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Price</span>
                      <strong>${Number(product.price).toFixed(2)}</strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Stock</span>
                      <strong>{product.stock}</strong>
                    </div>
                  </div>

                  <div style={styles.statusRow}>
                    <label style={styles.smallLabel}>Change Status</label>
                    <select
                      value={product.status || "active"}
                      onChange={(e) =>
                        updateStatus(product.id, e.target.value)
                      }
                      style={styles.statusSelect}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div style={styles.actionGroup}>
                    <button
                      onClick={() => startEdit(product)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusBadgeStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "capitalize",
  };

  if (status === "inactive") {
    return {
      ...base,
      backgroundColor: "#e5e7eb",
      color: "#374151",
    };
  }

  if (status === "pending") {
    return {
      ...base,
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "rejected") {
    return {
      ...base,
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    ...base,
    backgroundColor: "#dcfce7",
    color: "#166534",
  };
};

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
  },

  refreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
    marginBottom: "24px",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },

  formTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  formSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  cancelButton: {
    padding: "9px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  input: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
  },

  textarea: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  previewBox: {
    marginBottom: "18px",
    padding: "14px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  previewTitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  previewImage: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  submitButton: {
    padding: "11px 18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },

  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #eef1f6",
  },

  tableHeader: {
    marginBottom: "18px",
  },

  tableTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  tableSubtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  loadingBox: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
  },

  emptyBox: {
    padding: "30px",
    textAlign: "center",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "18px",
  },

  productCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  },

  imageBox: {
    height: "220px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noImage: {
    color: "#9ca3af",
    fontWeight: "700",
  },

  productBody: {
    padding: "16px",
  },

  productTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "10px",
  },

  productName: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },

  productId: {
    margin: "5px 0 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  description: {
    minHeight: "42px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "14px",
  },

  infoBox: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  infoLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
  },

  statusRow: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "14px",
  },

  smallLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#374151",
  },

  statusSelect: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
  },

  editButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
};