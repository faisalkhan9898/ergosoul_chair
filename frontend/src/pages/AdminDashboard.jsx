import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaShoppingCart, FaUsers, FaPercent, FaExclamationTriangle } from 'react-icons/fa';
import API from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get('/analytics/dashboard');
        const { metrics, lowStockAlerts, recentOrders, chartData } = response.data;
        
        setMetrics(metrics);
        setLowStock(lowStockAlerts);
        setRecentOrders(recentOrders);

        // Map Chart.js config
        setChartData({
          labels: chartData.map(c => c.month),
          datasets: [
            {
              label: 'Revenue ($)',
              data: chartData.map(c => c.revenue),
              borderColor: '#F59E0B', // Amber gold
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        });
      } catch (err) {
        console.error('Analytics load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex justify-center items-center py-20 bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Cards layout
  const cards = [
    { label: 'Total Revenue', value: `$${metrics.totalRevenue}`, icon: <FaDollarSign />, color: 'text-green-500 bg-green-500/10' },
    { label: 'Total Orders', value: metrics.totalOrders, icon: <FaShoppingCart />, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Customers', value: metrics.totalCustomers, icon: <FaUsers />, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: <FaPercent />, color: 'text-purple-500 bg-purple-500/10' }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Quick Console Actions */}
      <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white">Quick Console Operations</h3>
        <div className="flex flex-wrap gap-4 text-xs font-bold">
          <Link
            to="/admin/products?create=true"
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-xl transition-all shadow-md uppercase tracking-wider text-[10px]"
          >
            Create New Item Master
          </Link>
          <Link
            to="/admin/products"
            className="px-5 py-3 border border-gray-250 dark:border-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all uppercase tracking-wider text-[10px]"
          >
            Manage Item Master Catalog
          </Link>
          <Link
            to="/admin/orders"
            className="px-5 py-3 border border-gray-250 dark:border-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-850 rounded-xl transition-all uppercase tracking-wider text-[10px]"
          >
            Track Orders
          </Link>
        </div>
      </section>
      
      {/* 1. CARDS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm flex items-center justify-between transition-colors duration-300"
          >
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">{card.label}</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white block">{card.value}</span>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 2. CHARTS & LOW STOCK */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales curves */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">Revenue Operations Curve</h3>
          <div className="h-64">
            {chartData && (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(156, 163, 175, 0.05)' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            Inventory Stock Alerts
          </h3>
          
          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-400 font-light italic">All inventory levels safe.</p>
          ) : (
            <div className="space-y-3.5">
              {lowStock.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 px-4 py-3 rounded-xl text-xs font-semibold"
                >
                  <div>
                    <h4 className="text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                    <span className="text-[10px] text-gray-400 mt-0.5">{item.category}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded font-bold">
                    {item.stock} Left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. RECENT ORDERS TABLE */}
      <section className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">Recent Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b dark:border-gray-850 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                <th className="p-4">Txn Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                  <td className="p-4 font-mono font-bold uppercase text-[10px]">{ord._id}</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{ord.user?.name || 'Guest User'}</td>
                  <td className="p-4 text-gray-400">{ord.paymentInfo?.method}</td>
                  <td className="p-4 font-bold text-amber-500">${ord.totalAmount}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 font-bold uppercase text-[9px] rounded">
                      {ord.paymentInfo?.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-400 italic">Timeline tracked</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
