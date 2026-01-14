import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import ProductForm from '../components/ProductForm';
import useAuthStore from '../stores/auth';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuthStore();

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
    fetchProducts();
  }, [fetchProducts]);

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedProduct(undefined);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/hq/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products Management</h2>
      <button
        onClick={() => {
          setShowForm(!showForm);
          setSelectedProduct(undefined);
        }}
        className="bg-primary text-secondary py-2 px-4 rounded-lg mb-4"
      >
        {showForm && !selectedProduct ? 'Cancel' : 'Add Product'}
      </button>
      {showForm && <ProductForm product={selectedProduct} onSuccess={handleSuccess} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-gray-700">${product.price}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-500 text-white py-1 px-3 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white py-1 px-3 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
