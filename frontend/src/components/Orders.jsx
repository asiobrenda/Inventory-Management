// app/orders/page.jsx (unchanged)
'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/api';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Orders</h1>

        <Link href="/home">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Back to Products
          </button>
        </Link>

        <div>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="bg-white rounded-lg shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Order ID</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No orders
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="p-3">{order.id}</td>
                      <td className="p-3">{order.username || 'Anonymous'}</td>
                      <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <ul>
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.quantity} x {item.product.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3">
                        ${order.items
                          .reduce((sum, item) => sum + item.quantity * item.product.price, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
