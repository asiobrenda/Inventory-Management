'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

export default function CreateProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await createProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
      });
      console.log('Response:', res); // Debug response
      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
        setFormData({ name: '', price: '', quantity: '' });
        setTimeout(() => setSuccess(false), 3000);
        router.push('/home');
      } else {
        setError(`Failed to create product (Status: ${res.status})`);
        console.error('Failed to create product. Status:', res.status, 'Data:', res.data);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
      console.error('Error:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add New Product</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Product Name</label>
          <input
            name="name"
            placeholder="e.g. Coffee Mug"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Price ($)</label>
          <input
            name="price"
            type="number"
            placeholder="e.g. 19.99"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Quantity</label>
          <input
            name="quantity"
            type="number"
            placeholder="e.g. 100"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
      >
        Create Product
      </button>

      {success && (
        <div className="flex items-center space-x-2 text-green-600 mt-4">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">Product created successfully!</p>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 mt-4">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
