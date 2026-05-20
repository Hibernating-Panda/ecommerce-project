import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerOrders from "./pages/customer/CustomerOrders";
import TrackingPage from "./pages/customer/TrackingPage";

import DeliveryDashboard from "./pages/deliveryMan/DeliveryDashboard";
import AssignedDeliveries from "./pages/deliveryMan/AssignedDeliveries";
import DeliveryTracking from "./pages/deliveryMan/DeliveryTracking";
import DeliveryHistory from "./pages/deliveryMan/DeliveryHistory";

import ShopOwnerLayout from "./pages/shopowner/ShopOwnerLayout";
import ShopDashboard from "./pages/shopowner/ShopDashboard";
import ShopProducts from "./pages/shopowner/ShopProducts";
import AddProduct from "./pages/shopowner/AddProduct";
import ShopOrders from "./pages/shopowner/ShopOrders";
import ShopProfile from "./pages/shopowner/ShopProfile";
import ShopSales from "./pages/shopowner/ShopSales";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />

          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={["user", "customer"]}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={["user", "customer"]}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/customer/tracking/:id" element={<ProtectedRoute allowedRoles={["user", "customer"]}><TrackingPage /></ProtectedRoute>} />

          <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={["delivery_man"]}><DeliveryDashboard /></ProtectedRoute>} />
          <Route path="/delivery/assignments" element={<ProtectedRoute allowedRoles={["delivery_man"]}><AssignedDeliveries /></ProtectedRoute>} />
          <Route path="/delivery/tracking/:id" element={<ProtectedRoute allowedRoles={["delivery_man"]}><DeliveryTracking /></ProtectedRoute>} />
          <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={["delivery_man"]}><DeliveryHistory /></ProtectedRoute>} />

          <Route path="/shopowner" element={<ProtectedRoute allowedRoles={["shop_owner"]}><ShopOwnerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/shopowner/dashboard" replace />} />
            <Route path="dashboard" element={<ShopDashboard />} />
            <Route path="products" element={<ShopProducts />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<ShopOrders />} />
            <Route path="profile" element={<ShopProfile />} />
            <Route path="sales" element={<ShopSales />} />
          </Route>

          <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;