import React, { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../stores/auth';
import { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const [name, setName] = useState(product?.name || '');
  const [basePrice, setBasePrice] = useState(product?.base_price || 0);
  const [category, setCategory] = useState(product?.category || '');
  const { token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { name, base_price: basePrice, category };
    try {
      if (product) {
        await api.put(`/hq/products/${product.id}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/hq/products', productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-4">
      <h2 className="text-2xl font-bold mb-4">{product ? 'Edit Product' : 'Add Product'}</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Base Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border rounded-lg"
          value={basePrice}
          onChange={(e) => setBasePrice(Number(e.target.value))}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Category</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Burgers, Drinks, Desserts"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
      >
        {product ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;
