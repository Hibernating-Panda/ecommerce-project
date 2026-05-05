import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("LOGIN SUCCESS:", data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "shop_owner") {
        navigate("/shop");
      } else if (data.user.role === "delivery_man") {
        navigate("/delivery");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || "Login failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}>
          Login
        </h2>

        {errors.general && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.email ? "1px solid #c33" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
              placeholder="Enter your email"
            />

            {errors.email && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {errors.email[0]}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: errors.password ? "1px solid #c33" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
              placeholder="Enter your password"
            />

            {errors.password && (
              <div style={{ color: "#c33", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {errors.password[0]}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", color: "#666" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "#007bff", textDecoration: "none" }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;