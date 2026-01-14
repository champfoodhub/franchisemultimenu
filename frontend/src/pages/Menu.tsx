import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { MenuItem } from '../types';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import MenuCard from '../components/MenuCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/branch/menu', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (error) {
      showToast('Failed to fetch menu items', 'error');
      console.error('Failed to fetch menu items', error);
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeItems = menuItems.filter((item) => item.active);
  const inactiveItems = menuItems.filter((item) => !item.active);
  const outOfStockItems = menuItems.filter((item) => (item.stock || 0) === 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Branch Menu</h2>
          <p className="text-gray-600">View all menu items available at your branch</p>
        </div>
        <button
          onClick={fetchMenuItems}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{menuItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{inactiveItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-2">No menu items found</p>
          <p className="text-gray-400 text-sm">Contact HQ to add products to your branch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              name={item.product_name || `Product ${item.product_id}`}
              price={item.price}
              category={item.category}
              stock={item.stock}
              discount={item.discount}
              isActive={item.active !== undefined ? item.active : item.is_active}
              isOutOfStock={(item.stock || 0) === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;

