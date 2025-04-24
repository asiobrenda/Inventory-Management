// app/home/page.jsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProducts, deleteProduct, createOrder, getOrders } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [success, setSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      console.log('Products:', data); // Debug
      setProducts(data);
      setOrderItems(data.map((product) => ({ product_id: product.id, quantity: '' })));
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      console.log('Orders:', data); // Debug
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
        setOrderItems(orderItems.filter((item) => item.product_id !== id));
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setOrderItems(
      orderItems.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);
    setOrderLoading(true);

    const validItems = orderItems
      .filter((item) => item.quantity && parseInt(item.quantity) > 0)
      .map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      }));

    console.log('validItems:', validItems);

    if (validItems.length === 0) {
      setOrderError('Please select at least one product with a quantity.');
      setOrderLoading(false);
      return;
    }

    // Get username from localStorage or use the default "brenda" user
    const username = localStorage.getItem('username') || "brenda";

    try {
      const orderData = { item_data: validItems, username };
      console.log('orderData:', orderData);
      const res = await createOrder(orderData);
      if (res.status === 201 || res.status === 200) {
        setSuccess(true);
        setOrderItems(products.map((p) => ({ product_id: p.id, quantity: '' })));
        // Refresh orders after creating a new one
        fetchOrders();
        setTimeout(() => {
          setSuccess(false);
          router.push('/orders'); // Redirect to /orders
        }, 2000);
      } else {
        setOrderError('Failed to create order');
      }
    } catch (error) {
      console.error('Create Order Error:', error);
      const errorMessage = Array.isArray(error)
        ? error.join(', ')
        : error.message || 'An error occurred while creating the order';
      setOrderError(errorMessage);
    } finally {
      setOrderLoading(false);
    }
  };

  // Function to calculate total price for an order
  const calculateOrderTotal = (order) => {
    if (!order.items || order.items.length === 0) return 0;

    return order.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      return total + itemTotal;
    }, 0).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p>Manage your products and orders.</p>

        <div className="flex space-x-4 justify-center">
          <Link href="/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Create Product
            </button>
          </Link>
          <Link href="/orders">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              View Orders
            </button>
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-left">Products</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {orderError && <p className="text-red-600">{orderError}</p>}
          <form onSubmit={handleCreateOrder} className="bg-white rounded-lg shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Quantity Available</th>
                  <th className="p-3 text-left">Order Quantity</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No products
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const orderItem = orderItems.find(
                      (item) => item.product_id === product.id
                    );
                    return (
                      <tr key={product.id} className="border-t">
                        <td className="p-3">{product.name}</td>
                        <td className="p-3">${product.price}</td>
                        <td className="p-3">{product.quantity}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={orderItem ? orderItem.quantity : ''}
                            onChange={(e) =>
                              handleQuantityChange(product.id, e.target.value)
                            }
                            className="w-20 p-1 border rounded-lg"
                            placeholder="Qty"
                            disabled={orderLoading}
                          />
                        </td>
                        <td className="p-3">
                          <Link href={`/update/${product.id}`}>
                            <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg mr-2">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg"
                            disabled={orderLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {products.length > 0 && (
              <div className="p-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
                  disabled={orderLoading}
                >
                  {orderLoading ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            )}
          </form>
          {success && (
            <div className="flex items-center space-x-2 text-green-600 mt-4">
              <CheckCircle2 className="w-5 h-5" />
              <p>Order created! Redirecting...</p>
            </div>
          )}
        </div>

        {/* Recent Orders Display */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-left">Recent Orders</h2>
          {ordersLoading && <p>Loading orders...</p>}

          {orders.length === 0 && !ordersLoading ? (
            <div className="bg-white rounded-lg shadow-md p-4 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-100 p-3 flex justify-between items-center">
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <div className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()} by {order.username || 'Guest'}
                    </div>
                  </div>

                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left text-sm">Product</th>
                        <th className="p-2 text-right text-sm">Price</th>
                        <th className="p-2 text-right text-sm">Qty</th>
                        <th className="p-2 text-right text-sm">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.map((item) => {
                        const itemTotal = item.price * item.quantity;
                        return (
                          <tr key={item.id} className="border-t">
                            <td className="p-2 text-sm">{item.product_name}</td>
                            <td className="p-2 text-right text-sm">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="p-2 text-right text-sm">{item.quantity}</td>
                            <td className="p-2 text-right text-sm">${itemTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t-2 font-medium">
                      <tr>
                        <td colSpan="3" className="p-2 text-right">Total:</td>
                        <td className="p-2 text-right">
                          ${order.total_price || calculateOrderTotal(order)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ))}

              {orders.length > 3 && (
                <div className="text-center mt-2">
                  <Link href="/orders">
                    <button className="text-blue-600 hover:underline">
                      View all orders
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
