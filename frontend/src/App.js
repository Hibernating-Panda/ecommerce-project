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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;