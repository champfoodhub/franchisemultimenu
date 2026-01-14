import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/auth';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { user, isGuest } = useAuthStore();
  const [loading] = useState(false);

  // Stats for HQ
  const [hqStats] = useState({
    products: 12,
    schedules: 5,
    branches: 3,
  });

  // Stats for Branch
  const [branchStats] = useState({
    menuItems: 25,
    lowStock: 3,
  });

  useEffect(() => {
    // Simulate fetching stats or use actual API calls
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Guest'}! 👋
        </h1>
        <p className="text-red-100">
          {isGuest
            ? 'Browse our menu and explore available schedules.'
            : user?.role === 'HQ'
            ? 'Manage your products, schedules, and view stock reports.'
            : 'Manage your branch menu, update stock, and set discounts.'}
        </p>
      </div>

      {/* Role-based Dashboard */}
      {user?.role === 'HQ' && (
        <div className="space-y-6">
          {/* HQ Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/hq/products"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-800">{hqStats.products}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">📦</div>
              </div>
            </Link>
            <Link
              to="/hq/schedules"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Schedules</p>
                  <p className="text-3xl font-bold text-gray-800">{hqStats.schedules}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">📅</div>
              </div>
            </Link>
            <Link
              to="/hq/stock-reports"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Branches</p>
                  <p className="text-3xl font-bold text-gray-800">{hqStats.branches}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">🏪</div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/hq/products"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">➕</span>
                <span className="font-medium text-gray-700">Add New Product</span>
              </Link>
              <Link
                to="/hq/schedules"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">📅</span>
                <span className="font-medium text-gray-700">Create Schedule</span>
              </Link>
              <Link
                to="/hq/stock-reports"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">📊</span>
                <span className="font-medium text-gray-700">View Stock Reports</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'BRANCH' && (
        <div className="space-y-6">
          {/* Branch Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/branch/menu"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Menu Items</p>
                  <p className="text-3xl font-bold text-gray-800">{branchStats.menuItems}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">🍽️</div>
              </div>
            </Link>
            <Link
              to="/branch/stock-update"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Low Stock Items</p>
                  <p className="text-3xl font-bold text-red-600">{branchStats.lowStock}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">⚠️</div>
              </div>
            </Link>
            <Link
              to="/branch/time-based-menu"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Schedules</p>
                  <p className="text-3xl font-bold text-gray-800">2</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">⏰</div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/branch/stock-update"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">📝</span>
                <span className="font-medium text-gray-700">Update Stock</span>
              </Link>
              <Link
                to="/branch/menu"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">🍔</span>
                <span className="font-medium text-gray-700">View Menu</span>
              </Link>
              <Link
                to="/branch/time-based-menu"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <span className="text-2xl mr-3">⏰</span>
                <span className="font-medium text-gray-700">Time-Based Menu</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isGuest && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Our Menu</h2>
            <p className="text-gray-600 mb-4">
              Explore our delicious offerings and check out our special time-based menus.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🍽️ Regular Menu</h3>
                <p className="text-gray-500 text-sm mb-3">
                  View our complete menu with all available items.
                </p>
                <p className="text-red-600 font-medium">Coming Soon</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-lg mb-2">⏰ Time-Based Menu</h3>
                <p className="text-gray-500 text-sm mb-3">
                  Check what's available based on the current time.
                </p>
                <p className="text-red-600 font-medium">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

