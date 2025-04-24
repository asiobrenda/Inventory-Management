// app/dashboard/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, getProducts } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders(),
          getProducts()
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total revenue from all orders
  const calculateTotalRevenue = () => {
    return orders.reduce((total, order) => {
      const orderTotal = order.items?.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0) || 0;
      return total + orderTotal;
    }, 0).toFixed(2);
  };

  // Get top selling products
  const getTopSellingProducts = () => {
    const productSales = {};

    // Count sales for each product
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.product]) {
          productSales[item.product] = {
            id: item.product,
            name: item.product_name,
            totalSold: 0,
            revenue: 0
          };
        }
        productSales[item.product].totalSold += item.quantity;
        productSales[item.product].revenue += parseFloat(item.price) * item.quantity;
      });
    });

    // Convert to array and sort by quantity sold
    return Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5); // Get top 5
  };

  // Prepare data for charts
  const prepareProductSalesChart = () => {
    return getTopSellingProducts().map(product => ({
      name: product.name,
      sales: product.totalSold,
      revenue: product.revenue.toFixed(2)
    }));
  };

  // Get recent orders for display
  const getRecentOrders = () => {
    return [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Get low stock products
  const getLowStockProducts = () => {
    const lowStockThreshold = 10; // Set your threshold
    return products
      .filter(product => product.quantity < lowStockThreshold)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading dashboard data...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  const topSellingProducts = getTopSellingProducts();
  const chartData = prepareProductSalesChart();
  const recentOrders = getRecentOrders();
  const lowStockProducts = getLowStockProducts();
  const totalRevenue = calculateTotalRevenue();

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="space-x-2">
            <Link href="/home">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Home
              </button>
            </Link>
            <Link href="/orders">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                View Orders
              </button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Top Selling Products</h2>
            </div>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Units Sold']} />
                    <Bar dataKey="sales" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Recent Orders</h2>
            </div>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Order ID</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => {
                      const orderTotal = order.items?.reduce((sum, item) => {
                        return sum + (parseFloat(item.price) * item.quantity);
                      }, 0) || 0;

                      return (
                        <tr key={order.id} className="border-t">
                          <td className="px-4 py-2">#{order.id}</td>
                          <td className="px-4 py-2">{order.username || 'Guest'}</td>
                          <td className="px-4 py-2">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-right">${orderTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No recent orders</div>
            )}
            {recentOrders.length > 0 && (
              <div className="mt-4 text-right">
                <Link href="/orders">
                  <button className="text-blue-600 hover:underline text-sm">
                    View all orders →
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Popular Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Popular Products</h2>
            </div>
            {topSellingProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-right">Units Sold</th>
                      <th className="px-4 py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map(product => (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2 text-right">{product.totalSold}</td>
                        <td className="px-4 py-2 text-right">${product.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No sales data available</div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold">Low Stock Alert</h2>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-right">Available</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={product.quantity <= 5 ? "text-red-600 font-bold" : "text-yellow-600"}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">${parseFloat(product.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No low stock products</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
