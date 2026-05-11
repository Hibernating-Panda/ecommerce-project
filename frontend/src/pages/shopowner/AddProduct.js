import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
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
    sizes: [],
  });

  useEffect(() => {
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

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const addSize = () => {
    setProduct({
      ...product,
      sizes: [
        ...product.sizes,
        {
          size: "",
          price: "",
          stock: "",
        },
      ],
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
    const updatedSizes = product.sizes.filter((_, i) => i !== index);

    setProduct({
      ...product,
      sizes: updatedSizes,
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
            <label style={styles.label}>Base Price</label>
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
            <label style={styles.label}>Base Stock</label>
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

        <div style={styles.sizeSection}>
          <div style={styles.sizeHeader}>
            <div>
              <h2 style={styles.sizeTitle}>Product Sizes</h2>
              <p style={styles.sizeDesc}>
                Add different prices and stock for each size.
              </p>
            </div>

            <button type="button" onClick={addSize} style={styles.addSizeBtn}>
              + Add Size
            </button>
          </div>

          {product.sizes.length === 0 && (
            <p style={styles.noSize}>No size added. Base price will be used.</p>
          )}

          {product.sizes.map((item, index) => (
            <div key={index} style={styles.sizeRow}>
              <div>
                <label style={styles.smallLabel}>Size</label>
                <input
                  type="text"
                  value={item.size}
                  onChange={(e) => updateSize(index, "size", e.target.value)}
                  style={styles.sizeInput}
                  placeholder="M, L, XL"
                />
              </div>

              <div>
                <label style={styles.smallLabel}>Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateSize(index, "price", e.target.value)}
                  style={styles.sizeInput}
                  placeholder="20"
                  min="0"
                />
              </div>

              <div>
                <label style={styles.smallLabel}>Stock</label>
                <input
                  type="number"
                  value={item.stock}
                  onChange={(e) => updateSize(index, "stock", e.target.value)}
                  style={styles.sizeInput}
                  placeholder="10"
                  min="0"
                />
              </div>

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
            <div>
              <label style={styles.label}>Discount Percent</label>
              <input
                type="number"
                name="discount_percent"
                value={product.discount_percent}
                onChange={handleChange}
                style={styles.input}
                placeholder="Example: 20"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label style={styles.label}>Discount Start</label>
              <input
                type="datetime-local"
                name="discount_start"
                value={product.discount_start}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Discount End</label>
              <input
                type="datetime-local"
                name="discount_end"
                value={product.discount_end}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
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
    maxWidth: "980px",
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
    height: "130px",
    padding: "13px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "18px",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  sizeSection: {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "22px",
    backgroundColor: "#f9fafb",
  },
  sizeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
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
    backgroundColor: "#111827",
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
    gridTemplateColumns: "1fr 1fr 1fr auto",
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
  discountSection: {
    border: "1px solid #fde68a",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "22px",
    backgroundColor: "#fffbeb",
  },
};

export default AddProduct;