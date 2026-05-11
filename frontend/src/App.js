import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardPage from "./pages/customer/DashboardPage";
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
import ShopSales from "./pages/shopowner/ShopSales";

import DeliveryDashboard from "./pages/delivery/DashboardDelivery";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";
import DeliveryProfile from "./pages/delivery/DeliveryProfile";

import CustomerProtectedRoute from "./routes/CustomerProtectedRoute";
import CustomerOrdersPage from "./pages/customer/CustomerOrdersPage";
import CustomerWishlistPage from "./pages/customer/CustomerWishlistPage";
import CustomerReviewsPage from "./pages/customer/CustomerReviewsPage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import CustomerSettingsPage from "./pages/customer/CustomerSettingsPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";



import RoleRedirect from "./components/RoleRedirect";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<HomePage />} />
            <Route path="/register" element={<HomePage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

        

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
              <Route path="sales" element={<ShopSales />} />
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

            <Route element={<CustomerProtectedRoute />}>
              <Route path="/customer/dashboard" element={<DashboardPage />} />
              <Route path="/customer/orders" element={<CustomerOrdersPage />} />
              <Route path="/customer/wishlist" element={<CustomerWishlistPage />} />
              <Route path="/customer/reviews" element={<CustomerReviewsPage />} />
              <Route path="/customer/profile" element={<CustomerProfilePage />} />
              <Route path="/customer/settings" element={<CustomerSettingsPage />} />
              <Route path="/customer/cart" element={<CartPage />} />
              <Route path="/" element={<HomePage />} />
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