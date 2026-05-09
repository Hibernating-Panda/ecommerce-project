import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authPopup, setAuthPopup] = useState(null); // "login" | "register" | null
  const [loginMessage, setLoginMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });

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

  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "shop_owner") {
      navigate("/shop");
    } else if (role === "delivery_man") {
      navigate("/delivery");
    } else {
      navigate("/home");
    }
  };

  const openLogin = (message = "") => {
    setErrors({});
    setLoginMessage(message);
    setAuthPopup("login");
  };

  const openRegister = () => {
    setErrors({});
    setLoginMessage("");
    setAuthPopup("register");
  };

  const closePopup = () => {
    setAuthPopup(null);
    setErrors({});
    setLoginMessage("");
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!user) {
      openLogin("Login to continue");
      return;
    }

    console.log("Search:", search);
  };

  const handleCartClick = () => {
    if (!user) {
      openLogin("Login to continue");
      return;
    }

    navigate("/cart");
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
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

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
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

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!registerData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!registerData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!registerData.password) {
      newErrors.password = "Password is required";
    } else if (registerData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!registerData.password_confirmation) {
      newErrors.password_confirmation = "Confirm password is required";
    } else if (registerData.password !== registerData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (!registerData.role) {
      newErrors.role = "Role is required";
    }

    if (registerData.role === "admin") {
      newErrors.role = "Admin registration is not allowed";
    }

    return newErrors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    try {
      const data = await login({
        email: loginData.email,
        password: loginData.password,
      });

      closePopup();
      redirectByRole(data.user.role);
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error);

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateRegisterForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        password_confirmation: registerData.password_confirmation,
        role: registerData.role,
      });

      if (response.requires_approval) {
        setErrors({
          general: "Registration submitted. Please wait for admin approval before logging in.",
        });

        setTimeout(() => {
          setAuthPopup("login");
          setLoginMessage("Please wait for admin approval before logging in.");
        }, 1800);

        return;
      }

      closePopup();
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

  const getError = (field) => {
    if (!errors[field]) return "";

    if (Array.isArray(errors[field])) {
      return errors[field][0];
    }

    return errors[field];
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleOpenAuthPopup = (e) => {
      setErrors({});
      setLoginMessage(e.detail?.message || "");
      setAuthPopup(e.detail?.type || "login");
    };

    window.addEventListener("openAuthPopup", handleOpenAuthPopup);

    return () => {
      window.removeEventListener("openAuthPopup", handleOpenAuthPopup);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") {
      openLogin();
      navigate("/home", { replace: true });
    }

    if (location.pathname === "/register") {
      openRegister();
      navigate("/home", { replace: true });
    }
  }, [location.pathname]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "#fff",
          borderBottom: "2px solid #E8192C",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer", flexShrink: 0, minWidth: 80 }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#E8192C",
              letterSpacing: -1,
              fontFamily: "Georgia, serif",
            }}
          >
            E-Shop
          </span>
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: 6,
              overflow: "hidden",
              background: "#f5f5f5",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                flex: 1,
                padding: "8px 14px",
                border: "none",
                background: "transparent",
                fontSize: 14,
                color: "#333",
                outline: "none",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "0 14px",
                background: "#e0e0e0",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔍
            </button>
          </div>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            onClick={handleCartClick}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              fontSize: 22,
            }}
          >
            🛒
          </button>

          {!user ? (
            <>
              <button
                onClick={() => openLogin()}
                style={styles.outlineButton}
              >
                Login
              </button>

              <button
                onClick={openRegister}
                style={styles.redButton}
              >
                Sign Up
              </button>
            </>
          ) : (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <div
                onClick={() => setDropdownOpen((o) => !o)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#E8192C",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  userSelect: "none",
                  border: dropdownOpen ? "2px solid #b0001f" : "2px solid transparent",
                }}
              >
                {initials}
              </div>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                      {user?.email}
                    </div>
                  </div>

                  {[
                    {
                      label: "Dashboard",
                      icon: "🏠",
                      action: () => {
                        navigate("/dashboard");
                        setDropdownOpen(false);
                      },
                    },
                    {
                      label: "My Orders",
                      icon: "📦",
                      action: () => {
                        navigate("/orders");
                        setDropdownOpen(false);
                      },
                    },
                    {
                      label: "Edit Profile",
                      icon: "✏️",
                      action: () => {
                        navigate("/profile");
                        setDropdownOpen(false);
                      },
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={item.action}
                      style={styles.dropdownItem}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}

                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    <div onClick={handleLogout} style={styles.logoutItem}>
                      <span>🚪</span>
                      Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {authPopup && (
        <div onClick={closePopup} style={styles.overlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 22 }}>
                {authPopup === "login" ? "Login" : "Create Account"}
              </h2>

              <button onClick={closePopup} style={styles.closeButton}>
                ×
              </button>
            </div>

            {loginMessage && (
              <div style={styles.noticeBox}>
                {loginMessage}
              </div>
            )}

            {errors.general && (
              <div style={styles.errorBox}>
                {errors.general}
              </div>
            )}

            {authPopup === "login" ? (
              <form onSubmit={handleLoginSubmit}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Enter your email"
                  style={{
                    ...styles.input,
                    border: getError("email") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("email") && <p style={styles.fieldError}>{getError("email")}</p>}

                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  style={{
                    ...styles.input,
                    border: getError("password") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("password") && <p style={styles.fieldError}>{getError("password")}</p>}

                <button type="submit" disabled={loading} style={styles.submitButton}>
                  {loading ? "Logging in..." : "Login"}
                </button>

                <p style={styles.switchText}>
                  Don&apos;t have an account?{" "}
                  <span onClick={openRegister} style={styles.switchLink}>
                    Sign up
                  </span>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Enter your name"
                  style={{
                    ...styles.input,
                    border: getError("name") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("name") && <p style={styles.fieldError}>{getError("name")}</p>}

                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your email"
                  style={{
                    ...styles.input,
                    border: getError("email") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("email") && <p style={styles.fieldError}>{getError("email")}</p>}

                <label style={styles.label}>Register As</label>
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  style={{
                    ...styles.input,
                    border: getError("role") ? "1px solid #dc2626" : "1px solid #ddd",
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
                  {roleOptions.find((role) => role.value === registerData.role)?.description}
                </p>

                {getError("role") && <p style={styles.fieldError}>{getError("role")}</p>}

                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Enter your password"
                  style={{
                    ...styles.input,
                    border: getError("password") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("password") && <p style={styles.fieldError}>{getError("password")}</p>}

                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={registerData.password_confirmation}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  style={{
                    ...styles.input,
                    border: getError("password_confirmation") ? "1px solid #dc2626" : "1px solid #ddd",
                  }}
                  required
                />
                {getError("password_confirmation") && (
                  <p style={styles.fieldError}>{getError("password_confirmation")}</p>
                )}

                <button type="submit" disabled={loading} style={styles.submitButton}>
                  {loading ? "Registering..." : "Register"}
                </button>

                <p style={styles.switchText}>
                  Already have an account?{" "}
                  <span onClick={() => openLogin()} style={styles.switchLink}>
                    Login
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  outlineButton: {
    background: "#fff",
    border: "1px solid #ddd",
    color: "#333",
    padding: "8px 15px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  redButton: {
    background: "#E8192C",
    border: "none",
    color: "#fff",
    padding: "8px 15px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 42,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    minWidth: 200,
    zIndex: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "10px 16px",
    fontSize: 13,
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoutItem: {
    padding: "10px 16px",
    fontSize: 13,
    color: "#E8192C",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 600,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 26,
    cursor: "pointer",
    lineHeight: 1,
  },
  noticeBox: {
    background: "#FFF0F1",
    color: "#E8192C",
    padding: "10px 12px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 14,
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: 8,
    marginBottom: 14,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 600,
  },
  label: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontWeight: 700,
    fontSize: 13,
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    marginBottom: 10,
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
  },
  roleHint: {
    margin: "-4px 0 10px 0",
    color: "#6b7280",
    fontSize: 12,
  },
  submitButton: {
    width: "100%",
    background: "#E8192C",
    color: "#fff",
    border: "none",
    padding: "11px 12px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 6,
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 0,
    color: "#666",
  },
  switchLink: {
    color: "#E8192C",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default Navbar;