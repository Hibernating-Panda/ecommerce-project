import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import PopupMessage from "../../components/common/PopupMessage";

function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    redirect: false,
  });

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "",
    image: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    fetchCategories();

    if (editId) {
      fetchProduct();
    }
  }, [editId]);

  const showPopup = (type, title, message, redirect = false) => {
    setPopup({
      show: true,
      type,
      title,
      message,
      redirect,
    });
  };

  const closePopup = () => {
    const shouldRedirect = popup.redirect;

    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
      redirect: false,
    });

    if (shouldRedirect) {
      navigate("/shop/products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/shopowner/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
      showPopup("error", "Category Error", "Failed to load categories.");
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/shopowner/products/${editId}`);

      setProduct({
        name: res.data.name || "",
        price: res.data.price || "",
        stock: res.data.stock || "",
        category_id: res.data.category_id || "",
        image: res.data.image || "",
        description: res.data.description || "",
        status: res.data.status || "Active",
      });
    } catch (error) {
      console.error("Fetch product error:", error);
      showPopup("error", "Product Error", "Failed to load product.");
    }
  };

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        category_id: product.category_id ? Number(product.category_id) : null,
        image: product.image,
        description: product.description,
        status: product.status,
      };

      if (editId) {
        await api.put(`/shopowner/products/${editId}`, payload);
        showPopup(
          "success",
          "Product Updated",
          "Product information has been updated successfully.",
          true
        );
      } else {
        await api.post("/shopowner/products", payload);
        showPopup(
          "success",
          "Product Added",
          "New product has been added successfully.",
          true
        );
      }
    } catch (error) {
      console.error("Save product error:", error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showPopup("error", "Validation Error", errors);
      } else {
        showPopup("error", "Save Failed", "Failed to save product.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      <h1 style={styles.title}>{editId ? "Edit Product" : "Add Product"}</h1>
      <p style={styles.desc}>
        {editId
          ? "Update product information."
          : "Create a new product for your shop."}
      </p>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              style={styles.input}
              min="0"
              required
            />
          </div>

          <div>
            <label style={styles.label}>Stock</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              style={styles.input}
              min="0"
              required
            />
          </div>

          <div>
            <label style={styles.label}>Category</label>
            <select
              name="category_id"
              value={product.category_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={styles.label}>Image URL</label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleChange}
            style={styles.input}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={product.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            style={styles.textarea}
          />
        </div>

        {product.image && (
          <div style={styles.previewBox}>
            <p style={styles.previewText}>Image Preview</p>
            <img src={product.image} alt="Preview" style={styles.preview} />
          </div>
        )}

        <div style={styles.actions}>
          <button type="submit" style={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : editId ? "Update Product" : "Add Product"}
          </button>

          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => navigate("/shop/products")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#111827",
  },
  desc: {
    color: "#6b7280",
    marginBottom: "24px",
  },
  form: {
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    maxWidth: "900px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "800",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  textarea: {
    width: "100%",
    height: "130px",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  previewBox: {
    marginBottom: "20px",
  },
  previewText: {
    fontWeight: "800",
    color: "#374151",
  },
  preview: {
    width: "220px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  saveBtn: {
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default AddProduct;