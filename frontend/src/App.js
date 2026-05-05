<<<<<<< Updated upstream
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/user/DashboardPage';
import HomePage from './pages/Homepage';
import PhoneTabletPage from './pages/user/Category/PhoneTabletPage';
import ComputerPage from './pages/user/Category/ComputerPage';
import FashionPage from './pages/user/Category/FasionPage';
import api from './services/api';
=======
import React from "react";
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
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="/category/phones" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/computers" element={<ProtectedRoute><ComputerPage /></ProtectedRoute>} />
            {/* <Route path="/category/fashion" element={<ProtectedRoute><FashionPage /></ProtectedRoute>} />
            <Route path="/category/home-living" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/sports" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/health-beauty" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/gaming" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/books" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/automotive" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} />
            <Route path="/category/garden" element={<ProtectedRoute><PhoneTabletPage /></ProtectedRoute>} /> */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
=======
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
>>>>>>> Stashed changes
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;