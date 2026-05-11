import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';

const Layout = ({ children, title }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} userRole={user?.role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.name}
          userRole={user?.role}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
