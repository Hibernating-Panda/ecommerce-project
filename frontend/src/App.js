import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/user/DashboardPage";
import HomePage from "./pages/Homepage";

import Unauthorized from "./pages/Unauthorized";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";

import ShopDashboard from "./pages/ShopDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";

import RoleRedirect from "./components/RoleRedirect";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Normal user routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <HomePage
                    onNavigate={(page) => console.log("Navigate to:", page)}
                    onProductClick={(product) =>
                      console.log("Product clicked:", product)
                    }
                  />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Shop owner route */}
            <Route
              path="/shop"
              element={
                <ProtectedRoute allowedRoles={["shop_owner"]}>
                  <ShopDashboard />
                </ProtectedRoute>
              }
            />

            {/* Delivery man route */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={["delivery_man"]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;