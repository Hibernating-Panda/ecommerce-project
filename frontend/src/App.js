import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/user/DashboardPage";
import HomePage from "./pages/Homepage";

import Unauthorized from "./pages/Unauthorized";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProfile from "./pages/admin/AdminProfile";

import ShopOwnerLayout from "./pages/shopowner/ShopOwnerLayout";
import ShopDashboard from "./pages/shopowner/ShopDashboard";
import ShopProducts from "./pages/shopowner/ShopProducts";
import AddProduct from "./pages/shopowner/AddProduct";
import ShopOrders from "./pages/shopowner/ShopOrders";
import ShopProfile from "./pages/shopowner/ShopProfile";

import DeliveryDashboard from "./pages/delivery/DashboardDelivery";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";

import RoleRedirect from "./components/RoleRedirect";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<HomePage />} />
            <Route path="/register" element={<HomePage />} />
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
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Shop owner routes */}
            <Route
              path="/shop"
              element={
                <ProtectedRoute allowedRoles={["shop_owner"]}>
                  <ShopOwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ShopDashboard />} />
              <Route path="dashboard" element={<ShopDashboard />} />
              <Route path="products" element={<ShopProducts />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="orders" element={<ShopOrders />} />
              <Route path="profile" element={<ShopProfile />} />
            </Route>

            {/* Delivery routes */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={["delivery_man"]}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<DeliveryOrders />} />
              <Route path="orders" element={<DeliveryOrders />} />
              <Route path="history" element={<DeliveryHistory />} />
              <Route path="profile" element={<DeliveryProfile />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;