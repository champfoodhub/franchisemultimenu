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
  const [price, setPrice] = useState(product?.price || 0);
  const { token } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { name, price };
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
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Price</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded-lg"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-secondary py-2 rounded-lg"
      >
        {product ? 'Save' : 'Create'}
      </button>
    </form>
  );
};

export default ProductForm;
