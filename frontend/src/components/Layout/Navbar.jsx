import React, { useState } from "react";
import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick, userName, userRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole?.replace("_", " ")}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
              <button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <hr />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
