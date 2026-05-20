import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { roleThemes } from "../../theme/roleThemes";

export default function AdminProducts() {
  const theme = roleThemes.admin;

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category_id: "",
    shop_id: "",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories");
      setCategories(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/products", {
        params: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          category_id: filters.category_id || undefined,
          shop_id: filters.shop_id || undefined,
        },
      });

      setProducts(Array.isArray(response.data) ? response.data : response.data.data || []);
      setMeta(response.data?.meta || response.data || null);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      category_id: "",
      shop_id: "",
    });
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={{ ...styles.kicker, color: theme.primary }}>Admin</p>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.subtitle}>
            Search, filter, review, and update product status.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          style={{ ...styles.refreshButton, backgroundColor: theme.primary }}
        >
          Refresh
        </button>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.filterCard}>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search product name or description..."
          style={styles.input}
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="shop_id"
          value={filters.shop_id}
          onChange={handleFilterChange}
          placeholder="Shop ID"
          style={styles.input}
          min="1"
        />

        <button
          onClick={fetchProducts}
          style={{ ...styles.searchButton, backgroundColor: theme.primary }}
        >
          Search
        </button>

        <button onClick={clearFilters} style={styles.clearButton}>
          Clear
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>Product List</h2>
            <p style={styles.tableSubtitle}>
              Total products: {meta?.total || products.length}
            </p>
          </div>

          <span
            style={{
              ...styles.countBadge,
              backgroundColor: theme.primaryLight,
              color: theme.primaryDark,
            }}
          >
            {meta?.total || products.length} products
          </span>
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
                  {getProductImage(product) ? (
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={styles.productImage}
                    />
                  ) : (
                    <div style={styles.noImage}>No Image</div>
                  )}
                </div>

                <div style={styles.productBody}>
                  <div style={styles.productTop}>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{product.name}</h3>
                      <p style={styles.productId}>Product ID: #{product.id}</p>
                      <p style={styles.productId}>
                        Shop: {product.shop?.shop_name || `#${product.shop_id || "N/A"}`}
                      </p>
                      <p style={styles.productId}>
                        Category: {product.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <span style={getStatusBadgeStyle(product.status)}>
                      {formatStatus(product.status || "active")}
                    </span>
                  </div>

                  <p style={styles.description}>
                    {product.description || "No description provided."}
                  </p>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Price</span>
                      <strong>${Number(product.price || 0).toFixed(2)}</strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Stock</span>
                      <strong>{product.stock ?? 0}</strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Sold</span>
                      <strong>{product.total_sold || product.sold || 0}</strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Rating</span>
                      <strong>{product.reviews_avg_rating || product.average_rating || "N/A"}</strong>
                    </div>
                  </div>

                  <div style={styles.statusRow}>
                    <label style={styles.smallLabel}>Change Status</label>
                    <select
                      value={product.status || "active"}
                      onChange={(e) => updateStatus(product.id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
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

const getProductImage = (product) => {
  return product.image_url || product.image || null;
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusBadgeStyle = (status) => {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
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
    padding: "clamp(16px, 2.5vw, 28px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "12px",
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
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  refreshButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
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
  filterCard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
    marginBottom: "20px",
  },
  input: {
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  searchButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "none",
    color: "white",
    fontWeight: "800",
    cursor: "pointer",
  },
  clearButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    color: "#374151",
    fontWeight: "800",
    cursor: "pointer",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
    border: "1px solid #eef1f6",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },
  tableTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },
  tableSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  countBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
    gap: "18px",
  },
  productCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(15,23,42,0.04)",
    minWidth: 0,
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
    fontWeight: "800",
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
  productInfo: {
    minWidth: 0,
  },
  productName: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },
  productId: {
    margin: "5px 0 0",
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
    fontWeight: "800",
  },
  statusRow: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  smallLabel: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#374151",
  },
  statusSelect: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
  },
};