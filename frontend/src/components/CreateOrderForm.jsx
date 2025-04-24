// app/orders/create/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, getProducts } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

export default function CreateOrderForm() {
  const [items, setItems] = useState([{ product_id: '', quantity: '' }]);
  const [products, setProducts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const orderData = {
        item_data: items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      };
      const res = await createOrder(orderData);
      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
        setItems([{ product_id: '', quantity: '' }]);
        setTimeout(() => {
          setSuccess(false);
          router.push('/orders');
        }, 2000);
      } else {
        setError('Failed to create order');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-semibold">Create Order</h2>

      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Product</label>
              <select
                value={item.product_id}
                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                required
                disabled={loading}
              >
                <option value="">Select</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                required
                min="1"
                disabled={loading}
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg mt-6"
                disabled={loading}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          Add Item
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Order'}
      </button>

      {success && (
        <div className="flex items-center space-x-2 text-green-600 mt-4">
          <CheckCircle2 className="w-5 h-5" />
          <p>Order created!</p>
        </div>
      )}
    </form>
  );
}
