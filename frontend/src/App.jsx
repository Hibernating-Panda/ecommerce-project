import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/delivery/AdminOrders';
import AdminDeliveries from './pages/delivery/AdminDeliveries';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/delivery/AdminReports';

// Delivery Man Pages
import DeliveryDashboard from './pages/deliveryMan/DeliveryDashboard';
import AssignedDeliveries from './pages/deliveryMan/AssignedDeliveries';
import DeliveryTracking from './pages/deliveryMan/DeliveryTracking';
import DeliveryHistory from './pages/deliveryMan/DeliveryHistory';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PlaceOrder from './pages/customer/PlaceOrder';
import TrackingPage from './pages/customer/TrackingPage';
import CustomerOrders from './pages/customer/CustomerOrders';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/deliveries" element={<ProtectedRoute allowedRoles={['admin']}><AdminDeliveries /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

          {/* Delivery Man Routes */}
          <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery_man']}><DeliveryDashboard /></ProtectedRoute>} />
          <Route path="/delivery/assignments" element={<ProtectedRoute allowedRoles={['delivery_man']}><AssignedDeliveries /></ProtectedRoute>} />
          <Route path="/delivery/tracking/:id" element={<ProtectedRoute allowedRoles={['delivery_man']}><DeliveryTracking /></ProtectedRoute>} />
          <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={['delivery_man']}><DeliveryHistory /></ProtectedRoute>} />

          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/place-order" element={<ProtectedRoute allowedRoles={['customer']}><PlaceOrder /></ProtectedRoute>} />
          <Route path="/customer/tracking/:id" element={<ProtectedRoute allowedRoles={['customer']}><TrackingPage /></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerOrders /></ProtectedRoute>} />

          {/* Default Route */}
          <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
