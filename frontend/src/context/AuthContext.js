import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const login = async (formData) => {
    const response = await api.post("/login", formData);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setUser(response.data.user);

    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post("/register", formData);

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    }

    return response.data;
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/logout");
      }
    } catch (error) {
      console.log(error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get("/user");
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateAuthUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        updateAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}