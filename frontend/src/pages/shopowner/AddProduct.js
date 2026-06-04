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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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
      console.error("Fetch categories error:", error.response?.data || error);
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

      setImagePreview(res.data.image_url || "");
    } catch (error) {
      console.error("Fetch product error:", error.response?.data || error);
      showPopup("error", "Product Error", "Failed to load product.");
    }
  };

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
      navigate("/shopowner/products");
    }
  };

  const handleChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showPopup("error", "Invalid File", "Product image must be JPG, PNG, or WEBP.");
      return false;
    }

    if (file.size > 4 * 1024 * 1024) {
      showPopup("error", "File Too Large", "Product image must be 4MB or smaller.");
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addSize = () => {
    setProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", price: "", stock: "" }],
    }));
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = [...product.sizes];
    updatedSizes[index][field] = value;

    setProduct((prev) => ({
      ...prev,
      sizes: updatedSizes,
    }));
  };

  const removeSize = (index) => {
    setProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("price", Number(product.price || 0));
    formData.append("stock", Number(product.stock || 0));
    formData.append("category_id", product.category_id || "");
    formData.append("description", product.description || "");
    formData.append("status", product.status);
    formData.append(
      "discount_percent",
      product.discount_percent ? Number(product.discount_percent) : 0
    );
    formData.append("discount_start", product.discount_start || "");
    formData.append("discount_end", product.discount_end || "");

    const cleanSizes = product.sizes
      .filter((item) => item.size && item.price !== "")
      .map((item) => ({
        size: item.size,
        price: Number(item.price || 0),
        stock: Number(item.stock || 0),
      }));

    cleanSizes.forEach((item, index) => {
      formData.append(`sizes[${index}][size]`, item.size);
      formData.append(`sizes[${index}][price]`, item.price);
      formData.append(`sizes[${index}][stock]`, item.stock);
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = buildFormData();

      if (editId) {
        formData.append("_method", "PUT");

        await api.post(`/shopowner/products/${editId}`, formData);

        showPopup(
          "success",
          "Product Updated",
          "Product information has been updated successfully.",
          true
        );
      } else {
        await api.post("/shopowner/products", formData);

        showPopup(
          "success",
          "Product Added",
          "New product has been added successfully.",
          true
        );
      }
    } catch (error) {
      console.error("Save product error:", error.response?.data || error);

      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors)
          .flat()
          .join("\n");

        showPopup("error", "Validation Error", errors);
      } else {
        showPopup(
          "error",
          "Save Failed",
          error.response?.data?.message || "Failed to save product."
        );
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
        <p style={{ ...styles.kicker, color: theme.primary }}>Shop Owner</p>

        <h1 style={styles.title}>{editId ? "Edit Product" : "Add Product"}</h1>

        <p style={styles.desc}>
          {editId
            ? "Update product information, image, size options, and discounts."
            : "Create a new product for your shop with image, sizes, and discount."}
        </p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Product Information</h2>

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
              placeholder="If you use sizes, use the M size price as base price"
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

          <div>
            <label style={styles.label}>Description</label>

            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Describe your product..."
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Product Image</h2>
          <p style={styles.sectionDesc}>
            Upload the product image. It will be stored in Laravel storage and
            the database will store only the image path.
          </p>

          <div style={styles.uploadSection}>
            <div style={styles.uploadBox}>
              <label style={styles.label}>Upload Product Image</label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={styles.fileInput}
              />

              <p style={styles.helpText}>Accepted: JPG, PNG, WEBP. Max 4MB.</p>
            </div>

            <div style={styles.previewBox}>
              <p style={styles.previewText}>Image Preview</p>

              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={styles.preview} />
              ) : (
                <div style={styles.noPreview}>No image selected</div>
              )}
            </div>
          </div>
        </section>

        <section style={{ ...styles.sizeSection, borderColor: theme.border }}>
          <div style={styles.sizeHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Product Sizes</h2>
              <p style={styles.sectionDesc}>
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
        </section>

        <section style={styles.discountSection}>
          <h2 style={styles.sectionTitle}>Flash Sale Discount</h2>
          <p style={styles.sectionDesc}>
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
        </section>

        <div style={styles.actions}>
          <button
            type="submit"
            style={{
              ...styles.saveBtn,
              backgroundColor: theme.primary,
              opacity: saving ? 0.7 : 1,
            }}
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },

  section: {
    marginBottom: "26px",
  },

  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#111827",
  },

  sectionDesc: {
    margin: "0 0 16px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "white",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "130px",
    padding: "13px",
    borderRadius: "12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
  },

  uploadSection: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 260px",
    gap: "20px",
    alignItems: "start",
    marginBottom: "18px",
  },

  uploadBox: {
    background: "#f9fafb",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: "14px",
    padding: "16px",
  },

  fileInput: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },

  helpText: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },

  previewBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: "14px",
    padding: "14px",
  },

  previewText: {
    margin: "0 0 10px",
    fontWeight: "800",
    color: "#374151",
  },

  preview: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
    borderRadius: "12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    background: "#fff",
  },

  noPreview: {
    height: "170px",
    borderRadius: "12px",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontWeight: 800,
    background: "white",
  },

  sizeSection: {
    borderWidth: 1,
    borderStyle: "solid",
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
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },

  sizeInput: {
    width: "100%",
    padding: "11px",
    borderRadius: "10px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    boxSizing: "border-box",
    outline: "none",
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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fde68a",
    borderRadius: "18px",
    padding: "clamp(16px, 2.5vw, 20px)",
    marginBottom: "22px",
    backgroundColor: "#fffbeb",
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