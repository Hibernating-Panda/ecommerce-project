import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Add authentication header to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// For pages using normal fetch()
export const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/login");
    const isRegisterRequest = error.config?.url?.includes("/register");

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isRegisterRequest
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new CustomEvent("openAuthPopup", {
          detail: {
            type: "login",
            message: "Login to continue",
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;