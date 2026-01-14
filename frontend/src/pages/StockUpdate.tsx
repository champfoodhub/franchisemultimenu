import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { MenuItem } from '../types';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import MenuCard from '../components/MenuCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const StockUpdate = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [newStock, setNewStock] = useState(0);
  const [newDiscount, setNewDiscount] = useState(0);
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

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.patch(
        `/branch/products/${selectedItem.id}/stock`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Stock updated successfully', 'success');
      setStockModalOpen(false);
      fetchMenuItems();
    } catch (error) {
      showToast('Failed to update stock', 'error');
      console.error('Failed to update stock', error);
    }
  };

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.patch(
        `/branch/products/${selectedItem.id}/discount`,
        { discount: newDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Discount updated successfully', 'success');
      setDiscountModalOpen(false);
      fetchMenuItems();
    } catch (error) {
      showToast('Failed to update discount', 'error');
      console.error('Failed to update discount', error);
    }
  };

  const openStockModal = (item: MenuItem) => {
    setSelectedItem(item);
    setNewStock(item.stock || 0);
    setStockModalOpen(true);
  };

  const openDiscountModal = (item: MenuItem) => {
    setSelectedItem(item);
    setNewDiscount(item.discount || 0);
    setDiscountModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock & Discount Management</h2>
          <p className="text-gray-600">Update stock levels and discounts for menu items</p>
        </div>
        <button
          onClick={fetchMenuItems}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{menuItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600">
            {menuItems.filter((item) => (item.stock || 0) < 10).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Items on Discount</p>
          <p className="text-2xl font-bold text-green-600">
            {menuItems.filter((item) => (item.discount || 0) > 0).length}
          </p>
        </div>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No menu items found. Add products to get started.</p>
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
              onEditStock={() => openStockModal(item)}
              onEditDiscount={() => openDiscountModal(item)}
            />
          ))}
        </div>
      )}

      {/* Stock Update Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Update Stock"
      >
        <form onSubmit={handleUpdateStock}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Item: {selectedItem?.product_name || `Product ${selectedItem?.product_id}`}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">New Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStockModalOpen(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
            >
              Update Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Discount Update Modal */}
      <Modal
        isOpen={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        title="Update Discount"
      >
        <form onSubmit={handleUpdateDiscount}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Item: {selectedItem?.product_name || `Product ${selectedItem?.product_id}`}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newDiscount}
              onChange={(e) => setNewDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: {selectedItem?.discount || 0}%
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDiscountModalOpen(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
            >
              Update Discount
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockUpdate;
