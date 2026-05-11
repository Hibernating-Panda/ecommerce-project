import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    {
      value: "user",
      label: "Customer",
      description: "Browse products and place orders",
    },
    {
      value: "shop_owner",
      label: "Shop Owner",
      description: "Manage shop products and customer orders",
    },
    {
      value: "delivery_man",
      label: "Delivery Man",
      description: "Manage assigned deliveries",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (formData.role === "admin") {
      newErrors.role = "Admin registration is not allowed";
    }

    return newErrors;
  };

  const redirectByRole = (role) => {
    if (role === "shop_owner") {
      navigate("/shop");
    } else if (role === "delivery_man") {
      navigate("/delivery");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.requires_approval) {
        setErrors({
          general: "Registration submitted. Please wait for admin approval before logging in.",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2500);

        return;
      }

      redirectByRole(response.user.role);
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data || error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general:
            error.response?.data?.message ||
            "Registration failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Choose your account type and register.</p>

        {errors.general && <div style={styles.errorBox}>{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                border: errors.name ? "1px solid #dc2626" : "1px solid #ddd",
              }}
              placeholder="Enter your name"
            />
            {errors.name && <p style={styles.fieldError}>{errors.name}</p>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                border: errors.email ? "1px solid #dc2626" : "1px solid #ddd",
              }}
              placeholder="Enter your email"
            />
            {errors.email && <p style={styles.fieldError}>{errors.email}</p>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                ...styles.input,
                border: errors.role ? "1px solid #dc2626" : "1px solid #ddd",
              }}
              required
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

            <p style={styles.roleHint}>
              {
                roleOptions.find((role) => role.value === formData.role)
                  ?.description
              }
            </p>

            {errors.role && <p style={styles.fieldError}>{errors.role}</p>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                border: errors.password
                  ? "1px solid #dc2626"
                  : "1px solid #ddd",
              }}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p style={styles.fieldError}>{errors.password}</p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                border: errors.password_confirmation
                  ? "1px solid #dc2626"
                  : "1px solid #ddd",
              }}
              placeholder="Confirm your password"
            />
            {errors.password_confirmation && (
              <p style={styles.fieldError}>{errors.password_confirmation}</p>
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fb",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    width: "100%",
    maxWidth: "440px",
  },
  title: {
    textAlign: "center",
    marginBottom: "0.5rem",
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#6b7280",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "1rem",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "#374151",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  roleHint: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "0.85rem",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
    marginBottom: 0,
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    color: "#666",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "700",
  },
};

export default RegisterPage;