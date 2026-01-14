import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { MenuItem, Product } from '../types';
import useAuthStore from '../stores/auth';

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { token } = useAuthStore();

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await api.get('/branch/menu', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items', error);
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

  useEffect(() => {
    fetchMenuItems();
    fetchProducts();
  }, [fetchMenuItems, fetchProducts]);

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
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

export default Menu;
