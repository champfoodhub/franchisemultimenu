import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { Branch, Product, Stock } from '../types';
import useAuthStore from '../stores/auth';

const StockReports = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const { token } = useAuthStore();

  const fetchBranches = useCallback(async () => {
    try {
      const response = await api.get('/hq/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches', error);
    }
  }, [token]);

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

  const fetchStocks = useCallback(async () => {
    try {
      const response = await api.get('/hq/stock', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data);
    } catch (error) {
      console.error('Failed to fetch stocks', error);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchStocks();
  }, [fetchBranches, fetchProducts, fetchStocks]);

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Stock Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{branch.name}</h3>
            <ul>
              {stocks
                .filter((stock) => stock.branch_id === branch.id)
                .map((stock) => (
                  <li key={stock.id}>
                    {getProductName(stock.product_id)}: {stock.quantity}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockReports;
