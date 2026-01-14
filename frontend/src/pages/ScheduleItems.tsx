import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Product, Schedule, ScheduleItem } from '../types';
import useAuthStore from '../stores/auth';

const ScheduleItems = () => {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const { token } = useAuthStore();

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/hq/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedule(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    }
  }, [id, token]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get(`/hq/schedules/${id}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch schedule items', error);
    }
  }, [id, token]);

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
    fetchSchedule();
    fetchItems();
    fetchProducts();
  }, [fetchSchedule, fetchItems, fetchProducts]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
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
    } catch (error) {
      console.error('Failed to add item to schedule', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await api.delete(`/hq/schedules/${id}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to remove item from schedule', error);
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Manage Items for {schedule?.name}
      </h2>

      <form onSubmit={handleAddItem} className="mb-4">
        <h3 className="text-xl font-bold mb-2">Add Product</h3>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-secondary py-2 px-4 rounded-lg mt-2"
        >
          Add Product
        </button>
      </form>

      <div>
        <h3 className="text-xl font-bold mb-2">Products in this Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-bold">
                {getProductName(item.product_id)}
              </h4>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="bg-red-500 text-white py-1 px-3 rounded-lg mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleItems;
