import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import ProductForm from '../components/ProductForm';
import useAuthStore from '../stores/auth';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/hq/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      showToast('Failed to fetch products', 'error');
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedProduct(undefined);
    fetchProducts();
    showToast('Product saved successfully', 'success');
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/hq/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      showToast('Product deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete product', 'error');
      console.error('Failed to delete product', error);
    }
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
          <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedProduct(undefined);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <span className="mr-2">{showForm && !selectedProduct ? '✕' : '+'}</span>
          {showForm && !selectedProduct ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ProductForm product={selectedProduct} onSuccess={handleSuccess} />
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400 text-sm">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;

