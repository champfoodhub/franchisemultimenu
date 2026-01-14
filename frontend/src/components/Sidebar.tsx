import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  const hqLinks = [
    { path: '/hq/products', label: 'Products', icon: '📦' },
    { path: '/hq/schedules', label: 'Schedules', icon: '📅' },
    { path: '/hq/stock-reports', label: 'Stock Reports', icon: '📊' },
  ];

  const branchLinks = [
    { path: '/branch/menu', label: 'Menu', icon: '🍽️' },
    { path: '/branch/time-based-menu', label: 'Time-Based Menu', icon: '⏰' },
    { path: '/branch/stock-update', label: 'Update Stock', icon: '📝' },
  ];

  const links = user?.role === 'HQ' ? hqLinks : branchLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-red-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-red-700 p-4">
            <h2 className="text-white text-lg font-bold">
              {user?.role === 'HQ' ? 'HQ Admin Panel' : 'Branch Manager'}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1">
              {/* Always show Dashboard link */}
              <li>
                <Link
                  to="/"
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-red-100 text-red-700 border-r-4 border-red-700'
                      : 'text-gray-700 hover:bg-red-100'
                  }`}
                >
                  <span className="mr-3">🏠</span>
                  Dashboard
                </Link>
              </li>

              {/* Role-specific links */}
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-red-100 text-red-700 border-r-4 border-red-700'
                        : 'text-gray-700 hover:bg-red-100'
                    }`}
                    onClick={onClose}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-red-200">
            <p className="text-xs text-gray-500 text-center">
              FoodHub v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

