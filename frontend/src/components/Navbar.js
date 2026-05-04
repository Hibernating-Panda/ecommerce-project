import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // wire up your search logic here
    console.log('Search:', search);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#fff',
      borderBottom: '2px solid #E8192C',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate('/home')}
        style={{ cursor: 'pointer', flexShrink: 0, minWidth: 80 }}
      >
        <span style={{
          fontSize: 26,
          fontWeight: 900,
          color: '#E8192C',
          letterSpacing: -1,
          fontFamily: 'Georgia, serif',
        }}>L192</span>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: 640, margin: '0 auto' }}
      >
        <div style={{ display: 'flex', width: '100%', border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden', background: '#f5f5f5' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1,
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              color: '#333',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0 14px',
              background: '#e0e0e0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </form>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* Cart */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>

        {/* Profile dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#E8192C',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              userSelect: 'none',
              border: dropdownOpen ? '2px solid #b0001f' : '2px solid transparent',
              transition: 'border 0.15s',
            }}
          >
            {initials}
          </div>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 42,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              minWidth: 200,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{user?.email}</div>
              </div>

              {/* Menu items */}
              {[
                { label: 'Dashboard', icon: '🏠', action: () => { navigate('/dashboard'); setDropdownOpen(false); } },
                { label: 'My Orders', icon: '📦', action: () => { setDropdownOpen(false); } },
                { label: 'Edit Profile', icon: '✏️', action: () => { setDropdownOpen(false); } },
              ].map((item) => (
                <div
                  key={item.label}
                  onClick={item.action}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}

              <div style={{ borderTop: '1px solid #f0f0f0' }}>
                <div
                  onClick={handleLogout}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff0f1'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#E8192C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, transition: 'background 0.15s' }}
                >
                  <span style={{ fontSize: 15 }}>🚪</span>
                  Logout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;