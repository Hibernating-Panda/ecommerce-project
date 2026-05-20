import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import PopupMessage from "../../components/common/PopupMessage";
import { roleThemes } from "../../theme/roleThemes";

function AddProduct() {
  const theme = roleThemes.shop_owner;
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
    status: "active",
    sizes: [],
    discount_percent: "",
    discount_start: "",
    discount_end: "",
  });

  useEffect(() => {
    fetchCategories();

    if (editId) {
      fetchProduct();
    }
  }, [editId]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/shopowner/categories");
      setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
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
        status: res.data.status || "active",
        sizes: res.data.sizes || [],
        discount_percent: res.data.discount_percent || "",
        discount_start: res.data.discount_start
          ? res.data.discount_start.slice(0, 16)
          : "",
        discount_end: res.data.discount_end
          ? res.data.discount_end.slice(0, 16)
          : "",
      });
    } catch (error) {
      console.error("Fetch product error:", error);
      showPopup("error", "Product Error", "Failed to load product.");
    }
  };

  const showPopup = (type, title, message, redirect = false) => {
    setPopup({ show: true, type, title, message, redirect });
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
      navigate("/shopowner/products");
    }
  };

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const addSize = () => {
    setProduct({
      ...product,
      sizes: [...product.sizes, { size: "", price: "", stock: "" }],
    });
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = [...product.sizes];
    updatedSizes[index][field] = value;

    setProduct({
      ...product,
      sizes: updatedSizes,
    });
  };

  const removeSize = (index) => {
    setProduct({
      ...product,
      sizes: product.sizes.filter((_, i) => i !== index),
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
        image: product.image || null,
        description: product.description || null,
        status: product.status,
        discount_percent: product.discount_percent
          ? Number(product.discount_percent)
          : 0,
        discount_start: product.discount_start || null,
        discount_end: product.discount_end || null,
        sizes: product.sizes
          .filter((item) => item.size && item.price !== "")
          .map((item) => ({
            size: item.size,
            price: Number(item.price),
            stock: Number(item.stock || 0),
          })),
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
        const errors = Object.values(error.response.data.errors).flat().join("\n");
        showPopup("error", "Validation Error", errors);
      } else {
        showPopup("error", "Save Failed", "Failed to save product.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <PopupMessage
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />

      <div style={styles.header}>
        <p style={{ ...styles.kicker, color: theme.primary }}>
          Shop Owner
        </p>
        <h1 style={styles.title}>{editId ? "Edit Product" : "Add Product"}</h1>
        <p style={styles.desc}>
          {editId
            ? "Update product information."
            : "Create a new product for your shop."}
        </p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.grid}>
          <InputGroup
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />

          <InputGroup
            label="Base Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            min="0"
            required
          />

          <InputGroup
            label="Base Stock"
            name="stock"
            type="number"
            value={product.stock}
            onChange={handleChange}
            min="0"
            required
          />

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

        <InputGroup
          label="Image URL"
          name="image"
          value={product.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />

        <div>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={product.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ ...styles.sizeSection, borderColor: theme.border }}>
          <div style={styles.sizeHeader}>
            <div>
              <h2 style={styles.sizeTitle}>Product Sizes</h2>
              <p style={styles.sizeDesc}>
                Add different prices and stock for each size.
              </p>
            </div>

            <button
              type="button"
              onClick={addSize}
              style={{ ...styles.addSizeBtn, backgroundColor: theme.primary }}
            >
              + Add Size
            </button>
          </div>

          {product.sizes.length === 0 && (
            <p style={styles.noSize}>No size added. Base price will be used.</p>
          )}

          {product.sizes.map((item, index) => (
            <div key={index} style={styles.sizeRow}>
              <SizeInput
                label="Size"
                value={item.size}
                onChange={(value) => updateSize(index, "size", value)}
                placeholder="M, L, XL"
              />

              <SizeInput
                label="Price"
                type="number"
                value={item.price}
                onChange={(value) => updateSize(index, "price", value)}
                placeholder="20"
              />

              <SizeInput
                label="Stock"
                type="number"
                value={item.stock}
                onChange={(value) => updateSize(index, "stock", value)}
                placeholder="10"
              />

              <button
                type="button"
                onClick={() => removeSize(index)}
                style={styles.removeSizeBtn}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div style={styles.discountSection}>
          <h2 style={styles.sizeTitle}>Flash Sale Discount</h2>
          <p style={styles.sizeDesc}>
            Products with discount will appear in Flash Sale on the homepage.
          </p>

          <div style={styles.grid}>
            <InputGroup
              label="Discount Percent"
              name="discount_percent"
              type="number"
              value={product.discount_percent}
              onChange={handleChange}
              placeholder="Example: 20"
              min="0"
              max="100"
            />

            <InputGroup
              label="Discount Start"
              name="discount_start"
              type="datetime-local"
              value={product.discount_start}
              onChange={handleChange}
            />

            <InputGroup
              label="Discount End"
              name="discount_end"
              type="datetime-local"
              value={product.discount_end}
              onChange={handleChange}
            />
          </div>
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
          <button
            type="submit"
            style={{ ...styles.saveBtn, backgroundColor: theme.primary }}
            disabled={saving}
          >
            {saving ? "Saving..." : editId ? "Update Product" : "Add Product"}
          </button>

          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => navigate("/shopowner/products")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function InputGroup({ label, ...props }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input {...props} style={styles.input} />
    </div>
  );
}

function SizeInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label style={styles.smallLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.sizeInput}
        placeholder={placeholder}
        min="0"
      />
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1100px",
  },
  header: {
    marginBottom: "24px",
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
  form: {
    backgroundColor: "white",
    padding: "clamp(18px, 3vw, 28px)",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "800",
    color: "#374151",
  },
  smallLabel: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
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
    minHeight: "130px",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  sizeSection: {
    border: "1px solid #bfdbfe",
    borderRadius: "18px",
    padding: "clamp(16px, 2.5vw, 20px)",
    marginBottom: "22px",
    backgroundColor: "#f8fafc",
  },
  sizeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  sizeTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "22px",
  },
  sizeDesc: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  addSizeBtn: {
    color: "white",
    border: "none",
    padding: "11px 16px",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  noSize: {
    backgroundColor: "white",
    border: "1px dashed #d1d5db",
    color: "#6b7280",
    padding: "14px",
    borderRadius: "12px",
  },
  sizeRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    alignItems: "end",
    backgroundColor: "white",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "12px",
    border: "1px solid #e5e7eb",
  },
  sizeInput: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  removeSizeBtn: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "11px 14px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },
  discountSection: {
    border: "1px solid #fde68a",
    borderRadius: "18px",
    padding: "clamp(16px, 2.5vw, 20px)",
    marginBottom: "22px",
    backgroundColor: "#fffbeb",
  },
  previewBox: {
    marginBottom: "20px",
  },
  previewText: {
    fontWeight: "800",
    color: "#374151",
  },
  preview: {
    width: "min(100%, 260px)",
    height: "160px",
    objectFit: "cover",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  saveBtn: {
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