import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

      {/* Shared Navbar (logo + search + profile/logout) */}
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Welcome to Your Dashboard</h2>

          {/* Profile */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#555', marginBottom: '1rem' }}>Your Profile</h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>Name:</strong> {user?.name}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {user?.email}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>User ID:</strong> {user?.id}</p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Member Since:</strong>{' '}
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#555', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/home')}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#E8192C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Browse Store
              </button>
              <button
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                My Orders
              </button>
              <button
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Auth status */}
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