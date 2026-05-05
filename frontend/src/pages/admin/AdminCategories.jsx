import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/categories");
      setCategories(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createCategory = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.post("/admin/categories", formData);

      setMessage("Category created successfully.");
      resetForm();
      fetchCategories();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateCategory = async (e) => {
    e.preventDefault();

    if (!editingCategory) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put(`/admin/categories/${editingCategory.id}`, formData);

      setMessage("Category updated successfully.");
      resetForm();
      fetchCategories();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Products in this category will become uncategorized.")) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await api.delete(`/admin/categories/${id}`);

      setMessage("Category deleted successfully.");
      fetchCategories();
    } catch (error) {
      console.log(error.response?.data || error);
      setError(error.response?.data?.message || "Failed to delete category.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Categories</h1>
          <p style={styles.subtitle}>
            Create and organize product categories for the e-commerce catalog.
          </p>
        </div>

        <button onClick={fetchCategories} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.formCard}>
        <div style={styles.formHeader}>
          <div>
            <h2 style={styles.formTitle}>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h2>
            <p style={styles.formSubtitle}>
              Categories help customers browse products more easily.
            </p>
          </div>

          {editingCategory && (
            <button onClick={resetForm} style={styles.cancelButton}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={editingCategory ? updateCategory : createCategory}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category Name</label>
              <input
                type="text"
                name="name"
                placeholder="Example: Electronics"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                name="description"
                placeholder="Short category description"
                value={formData.description}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} style={styles.submitButton}>
            {saving
              ? "Saving..."
              : editingCategory
              ? "Update Category"
              : "Create Category"}
          </button>
        </form>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.tableTitle}>Category List</h2>
            <p style={styles.tableSubtitle}>
              Total categories: {categories.length}
            </p>
          </div>

          <span style={styles.countBadge}>{categories.length} categories</span>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyBox}>No categories found.</div>
        ) : (
          <div style={styles.categoryGrid}>
            {categories.map((category) => (
            <div key={category.id} style={styles.categoryCard}>
              <div style={styles.categoryLeft}>
                <div style={styles.categoryIcon}>
                  {category.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 style={styles.categoryName}>{category.name}</h3>
                  <p style={styles.categorySlug}>/{category.slug}</p>
                  <p style={styles.categoryDescription}>
                    {category.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div style={styles.categoryRight}>
                <span style={styles.idBadge}>#{category.id}</span>

                <div style={styles.actionGroup}>
                  <button
                    onClick={() => startEdit(category)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCategory(category.id)}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  countBadge: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
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

  categoryGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  categoryCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    padding: "18px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  },

  categoryLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
    minWidth: 0,
  },

  categoryRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexShrink: 0,
  },

  categoryName: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
  },

  categorySlug: {
    margin: "4px 0 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  categoryDescription: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
  },

  categoryIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "900",
    flexShrink: 0,
  },

  categoryBody: {
    flex: 1,
    minWidth: 0,
  },

  categoryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "8px",
  },

  idBadge: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    height: "fit-content",
  },

  editButton: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "800",
  },
};