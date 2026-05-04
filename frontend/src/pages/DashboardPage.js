import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <nav style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>E-Shop Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Welcome, {user?.name}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Welcome to Your Dashboard</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#555', marginBottom: '1rem' }}>Your Profile</h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {user?.name}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {user?.email}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>User ID:</strong> {user?.id}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#555', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Products
              </button>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                My Orders
              </button>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#555', marginBottom: '1rem' }}>Authentication Status</h3>
            <div style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '1rem', 
              borderRadius: '4px',
              border: '1px solid #c3e6cb'
            }}>
              ✅ You are successfully authenticated and logged in!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
