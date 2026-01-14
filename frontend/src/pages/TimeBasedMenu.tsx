import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { MenuItem, Product, Schedule } from '../types';
import useAuthStore from '../stores/auth';

const TimeBasedMenu = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const { token } = useAuthStore();

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await api.get('/branch/schedules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/branch/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  }, [token]);

  const fetchMenuItems = useCallback(async () => {
    if (!selectedSchedule) return;
    try {
      const response = await api.get(`/branch/menu/schedule/${selectedSchedule}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items', error);
    }
  }, [selectedSchedule, token]);

  useEffect(() => {
    fetchSchedules();
    fetchProducts();
  }, [fetchSchedules, fetchProducts]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Time-Based Menu</h2>
      <select
        value={selectedSchedule}
        onChange={(e) => setSelectedSchedule(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg mb-4"
      >
        <option value="">Select a schedule</option>
        {schedules.map((schedule) => (
          <option key={schedule.id} value={schedule.id}>
            {schedule.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">
              {getProductName(item.product_id)}
            </h3>
            <p className="text-gray-700">${item.price}</p>
            <p className={`text-sm ${item.active ? 'text-green-500' : 'text-red-500'}`}>
              {item.active ? 'Active' : 'Inactive'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeBasedMenu;
