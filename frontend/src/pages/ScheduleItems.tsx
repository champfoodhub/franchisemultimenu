import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Product, Schedule, ScheduleItem } from '../types';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ScheduleItems = () => {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/hq/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedule(response.data);
    } catch (error) {
      showToast('Failed to fetch schedule', 'error');
      console.error('Failed to fetch schedule', error);
    }
  }, [id, token, showToast]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get(`/hq/schedules/${id}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      showToast('Failed to fetch schedule items', 'error');
      console.error('Failed to fetch schedule items', error);
    }
  }, [id, token, showToast]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/hq/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSchedule(), fetchItems(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSchedule, fetchItems, fetchProducts]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setActionLoading(true);
    try {
      await api.post(
        `/hq/schedules/${id}/items`,
        { product_id: selectedProduct },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchItems();
      setSelectedProduct('');
      showToast('Item added to schedule', 'success');
    } catch (error) {
      showToast('Failed to add item to schedule', 'error');
      console.error('Failed to add item to schedule', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    setActionLoading(true);
    try {
      await api.delete(`/hq/schedules/${id}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
      showToast('Item removed from schedule', 'success');
    } catch (error) {
      showToast('Failed to remove item from schedule', 'error');
      console.error('Failed to remove item from schedule', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || `Product ${productId}`;
  };

  const availableProducts = products.filter(
    (product) => !items.some((item) => item.product_id === product.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Manage Items for "{schedule?.name}"
        </h2>
        <p className="text-gray-600">
          {schedule?.type === 'TIME_SLOT' 
            ? `${schedule.start_time} - ${schedule.end_time}`
            : `${schedule?.start_date} to ${schedule?.end_date}`
          }
        </p>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Add Product to Schedule</h3>
        <form onSubmit={handleAddItem} className="flex gap-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={actionLoading}
          >
            <option value="">Select a product</option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedProduct || actionLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {actionLoading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
        {availableProducts.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            All products have been added to this schedule.
          </p>
        )}
      </div>

      {/* Products in Schedule */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Products in this Schedule ({items.length})
        </h3>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products in this schedule yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">
                    {getProductName(item.product_id)}
                  </h4>
                  <p className="text-sm text-gray-500">ID: {item.id}</p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleItems;

