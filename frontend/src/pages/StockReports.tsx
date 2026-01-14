import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { Branch, Product, Stock } from '../types';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StockReports = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const fetchBranches = useCallback(async () => {
    try {
      const response = await api.get('/hq/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(response.data);
    } catch (error) {
      showToast('Failed to fetch branches', 'error');
      console.error('Failed to fetch branches', error);
    }
  }, [token, showToast]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/hq/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      showToast('Failed to fetch products', 'error');
      console.error('Failed to fetch products', error);
    }
  }, [token, showToast]);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/hq/stock', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data);
    } catch (error) {
      showToast('Failed to fetch stocks', 'error');
      console.error('Failed to fetch stocks', error);
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchBranches(), fetchProducts(), fetchStocks()]);
    };
    loadData();
  }, [fetchBranches, fetchProducts, fetchStocks]);

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || `Product ${productId}`;
  };

  const getTotalStock = (branchId: number) => {
    return stocks
      .filter((stock) => stock.branch_id === branchId)
      .reduce((sum, stock) => sum + stock.quantity, 0);
  };

  const getLowStockCount = (branchId: number) => {
    return stocks.filter(
      (stock) => stock.branch_id === branchId && stock.quantity < 10
    ).length;
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
          <h2 className="text-2xl font-bold text-gray-800">Stock Reports</h2>
          <p className="text-gray-600">View stock levels across all branches</p>
        </div>
        <button
          onClick={fetchStocks}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-2">No branches found</p>
          <p className="text-gray-400 text-sm">Add branches to see stock reports.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {branches.map((branch) => {
            const branchStocks = stocks.filter(
              (stock) => stock.branch_id === branch.id
            );
            const totalStock = getTotalStock(branch.id);
            const lowStockCount = getLowStockCount(branch.id);

            return (
              <div
                key={branch.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Branch Header */}
                <div className="bg-red-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{branch.name}</h3>
                      <p className="text-red-100 text-sm">
                        {branchStocks.length} products • Total Stock: {totalStock}
                      </p>
                    </div>
                    {lowStockCount > 0 && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {lowStockCount} Low Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Details */}
                <div className="p-4">
                  {branchStocks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No stock records for this branch
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-gray-600 font-medium">
                              Product
                            </th>
                            <th className="text-right py-2 px-3 text-gray-600 font-medium">
                              Quantity
                            </th>
                            <th className="text-right py-2 px-3 text-gray-600 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {branchStocks.map((stock) => (
                            <tr
                              key={stock.id}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="py-3 px-3">
                                {getProductName(stock.product_id)}
                              </td>
                              <td className="py-3 px-3 text-right font-medium">
                                {stock.quantity}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {stock.quantity === 0 ? (
                                  <span className="text-red-600 font-medium">
                                    Out of Stock
                                  </span>
                                ) : stock.quantity < 10 ? (
                                  <span className="text-yellow-600 font-medium">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    In Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockReports;

