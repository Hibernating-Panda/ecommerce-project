import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, Users, BarChart3,
  Navigation, LogOut, Menu, X
} from 'lucide-react';

const Sidebar = ({ isOpen, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Orders', path: '/admin/orders', icon: Package },
      { label: 'Deliveries', path: '/admin/deliveries', icon: Truck },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    ],
    delivery_man: [
      { label: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
      { label: 'Assigned Deliveries', path: '/delivery/assignments', icon: Truck },
      { label: 'History', path: '/delivery/history', icon: Package },
    ],
    customer: [
      { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
      { label: 'Place Order', path: '/customer/place-order', icon: Package },
      { label: 'My Orders', path: '/customer/orders', icon: Navigation },
    ]
  };

  const currentMenuItems = menuItems[userRole] || [];
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
      {/* Logo */}
      <div className="p-4 bg-blue-600 flex items-center justify-between">
        {isOpen && <h2 className="font-bold text-lg">DeliveryMgr</h2>}
        {isOpen && <Truck className="w-6 h-6" />}
      </div>

      {/* Menu Items */}
      <nav className="mt-8 space-y-2 px-2">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={() => {
            navigate('/login');
          }}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:text-white transition-colors ${
            isOpen ? '' : 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
