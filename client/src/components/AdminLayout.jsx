import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/courses', label: 'Courses', icon: <FaBook /> },
    { path: '/admin/students', label: 'Students', icon: <FaUserGraduate /> },
    { path: '/admin/instructors', label: 'Instructors', icon: <FaChalkboardTeacher /> },
    { path: '/admin/quizzes', label: 'Quizzes', icon: <FaClipboardList /> },
    { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            <Link to="/admin" className="text-xl font-bold text-white">
              Admin Panel
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-white lg:hidden"
            >
              <FaTimes />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.path
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : ''} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="h-16 bg-white shadow">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <FaBars />
            </button>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 