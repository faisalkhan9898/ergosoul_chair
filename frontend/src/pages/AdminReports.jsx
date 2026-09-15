import React, { useState, useEffect } from 'react';
import {
  FaChartBar,
  FaFileInvoiceDollar,
  FaBoxes,
  FaLayerGroup,
  FaUsers,
  FaDownload,
  FaPrint,
  FaFilter,
  FaCalendarAlt,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import API from '../services/api';
import { useCurrency } from '../hooks/useCurrency';

export const AdminReports = () => {
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Date filters
  const [datePreset, setDatePreset] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sub-filters
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report datasets
  const [salesReport, setSalesReport] = useState({ summary: {}, orders: [] });
  const [inventoryReport, setInventoryReport] = useState({ summary: {}, products: [] });
  const [categoryReport, setCategoryReport] = useState([]);
  const [customerReport, setCustomerReport] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  // Compute date range based on preset
  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (datePreset === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === 'last_7_days') {
      start.setDate(now.getDate() - 7);
    } else if (datePreset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (datePreset === 'last_30_days') {
      start.setDate(now.getDate() - 30);
    } else if (datePreset === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1);
    }

    if (datePreset !== 'custom') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [datePreset]);

  // Fetch departments for filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get('/categories');
        setDepartmentsList(res.data.categories.map(c => c.name));
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch report data on filter change
  useEffect(() => {
    fetchActiveReport();
  }, [activeTab, startDate, endDate, orderStatus, paymentStatus, paymentMethod, departmentFilter, stockStatusFilter]);

  const fetchActiveReport = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'sales') {
        const params = {
          startDate,
          endDate,
          orderStatus,
          paymentStatus,
          paymentMethod
        };
        const res = await API.get('/reports/sales', { params });
        setSalesReport(res.data);
      } else if (activeTab === 'inventory') {
        const params = {
          mainCategory: departmentFilter,
          stockStatus: stockStatusFilter
        };
        const res = await API.get('/reports/inventory', { params });
        setInventoryReport(res.data);
      } else if (activeTab === 'categories') {
        const res = await API.get('/reports/categories');
        setCategoryReport(res.data.categories);
      } else if (activeTab === 'customers') {
        const res = await API.get('/reports/customers');
        setCustomerReport(res.data.customers);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'sales') {
      csvContent += 'Order ID,Date,Customer Name,Customer Email,Items Count,Payment Method,Payment Status,Order Status,Tax,Shipping,Discount,Total Amount\n';
      salesReport.orders.forEach(o => {
        const row = [
          o._id,
          new Date(o.createdAt).toLocaleDateString(),
          `"${o.user?.name || 'Guest'}"`,
          o.user?.email || 'N/A',
          o.items?.length || 0,
          o.paymentInfo?.method || 'N/A',
          o.paymentInfo?.status || 'N/A',
          o.orderStatus,
          o.tax || 0,
          o.shippingCharges || 0,
          o.couponDiscount || 0,
          o.totalAmount
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (activeTab === 'inventory') {
      csvContent += 'Product ID,Product Name,Department,Subcategory,Price,Stock Units,Total Valuation,Status\n';
      inventoryReport.products.forEach(p => {
        const status = p.stock === 0 ? 'Out of Stock' : p.stock <= 3 ? 'Low Stock' : 'In Stock';
        const row = [
          p._id,
          `"${p.name}"`,
          `"${p.mainCategory}"`,
          `"${p.category}"`,
          p.price,
          p.stock,
          (p.stock * p.price).toFixed(2),
          status
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (activeTab === 'categories') {
      csvContent += 'Department,Icon,Display Order,Subcategories Count,Total Models,Stock Units,Total Valuation,Avg Price,Units Sold,Revenue Generated\n';
      categoryReport.forEach(c => {
        const row = [
          `"${c.name}"`,
          c.icon,
          c.displayOrder,
          c.subcategoriesCount,
          c.totalModels,
          c.totalStock,
          c.totalStockValue,
          c.averagePrice,
          c.unitsSold,
          c.revenueSold
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (activeTab === 'customers') {
      csvContent += 'Customer Name,Email,Phone,Verified,Total Orders,Paid Orders,Total Spend,Latest Order Date\n';
      customerReport.forEach(c => {
        const row = [
          `"${c.name}"`,
          c.email,
          `"${c.phoneNumber}"`,
          c.isVerified ? 'Yes' : 'No',
          c.totalOrders,
          c.paidOrdersCount,
          c.totalSpent,
          c.latestOrder ? new Date(c.latestOrder).toLocaleDateString() : 'None'
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ergosoul_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered lists by search input
  const filteredOrders = salesReport.orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.orderStatus?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = inventoryReport.products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mainCategory?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const filteredCustomers = customerReport.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phoneNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-sans text-xs">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
            <FaChartBar className="text-amber-500" />
            Report Master & Business Intelligence
          </h1>
          <p className="text-[10px] text-gray-400">
            Real-time analytics, revenue breakdowns, stock valuation, and accounting summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
            title="Download CSV for Excel / Google Sheets"
          >
            <FaDownload />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs flex items-center gap-2 border dark:border-gray-700 transition-colors"
          >
            <FaPrint />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex border-b dark:border-gray-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'sales', label: 'Sales & Revenue Report', icon: <FaFileInvoiceDollar /> },
          { id: 'inventory', label: 'Inventory & Stock Valuation', icon: <FaBoxes /> },
          { id: 'categories', label: 'Department Performance', icon: <FaLayerGroup /> },
          { id: 'customers', label: 'Customer Purchase Insights', icon: <FaUsers /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-t-xl font-bold flex items-center gap-2 border-b-2 text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-50/5 dark:hover:bg-gray-800/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4 font-semibold">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quick Date Presets (Visible for Sales Tab) */}
          {activeTab === 'sales' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
                <FaCalendarAlt className="text-amber-500" /> Date Range:
              </span>
              {[
                { id: 'today', label: 'Today' },
                { id: 'last_7_days', label: 'Last 7 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_30_days', label: 'Last 30 Days' },
                { id: 'this_year', label: 'This Year' },
                { id: 'custom', label: 'Custom' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    datePreset === p.id
                      ? 'bg-amber-500 text-gray-950 shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="flex-1 max-w-xs relative ml-auto">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-[10px]" />
            <input
              type="text"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs"
            />
          </div>
        </div>

        {/* Custom Range & Sub-filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t dark:border-gray-850">
          {activeTab === 'sales' && datePreset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs"
              />
            </div>
          )}

          {activeTab === 'sales' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[10px]">Order Status:</span>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[10px]">Payment:</span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[10px]">Department:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="all">All Departments</option>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[10px]">Stock Level:</span>
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (1-3 units)</option>
                  <option value="out_of_stock">Out of Stock (0 units)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {/* TAB 1: SALES & REVENUE REPORT */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Gross Revenue</span>
              <h3 className="text-xl font-bold text-amber-500 mt-1">{formatPrice(salesReport.summary.totalRevenue || 0)}</h3>
              <span className="text-[10px] text-gray-400">{salesReport.summary.totalOrders || 0} Total Orders</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Paid Realized Sales</span>
              <h3 className="text-xl font-bold text-emerald-500 mt-1">{formatPrice(salesReport.summary.paidRevenue || 0)}</h3>
              <span className="text-[10px] text-gray-400">{salesReport.summary.paidOrdersCount || 0} Paid Orders</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Avg Order Value</span>
              <h3 className="text-xl font-bold text-blue-500 mt-1">{formatPrice(salesReport.summary.averageOrderValue || 0)}</h3>
              <span className="text-[10px] text-gray-400">Per Transaction</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Tax Collected</span>
              <h3 className="text-xl font-bold text-purple-500 mt-1">{formatPrice(salesReport.summary.totalTax || 0)}</h3>
              <span className="text-[10px] text-gray-400">GST / Tax Master</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Discounts Given</span>
              <h3 className="text-xl font-bold text-rose-500 mt-1">{formatPrice(salesReport.summary.totalDiscount || 0)}</h3>
              <span className="text-[10px] text-gray-400">Coupon Deductions</span>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-855 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4">Tax</th>
                    <th className="p-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        No orders found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                        <td className="p-4">
                          <span className="font-mono font-bold text-gray-900 dark:text-white block">
                            #{o._id.substring(o._id.length - 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-900 dark:text-white block">{o.user?.name || 'Guest User'}</span>
                          <span className="text-[10px] text-gray-400">{o.user?.email || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-semibold">
                          {o.items?.length || 0} items
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300 block">{o.paymentInfo?.method || 'N/A'}</span>
                          <span className={`text-[10px] font-bold ${
                            o.paymentInfo?.status === 'Paid' ? 'text-green-500' : o.paymentInfo?.status === 'Pending' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {o.paymentInfo?.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            o.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-500' : o.orderStatus === 'Shipped' ? 'bg-blue-500/10 text-blue-500' : o.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">{formatPrice(o.tax || 0)}</td>
                        <td className="p-4 text-right font-bold text-amber-500 text-sm">
                          {formatPrice(o.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK VALUATION REPORT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Executive Inventory KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Stock Valuation</span>
              <h3 className="text-xl font-bold text-amber-500 mt-1">{formatPrice(inventoryReport.summary.totalStockValue || 0)}</h3>
              <span className="text-[10px] text-gray-400">Estimated Retail Value</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Physical Units</span>
              <h3 className="text-xl font-bold text-blue-500 mt-1">{inventoryReport.summary.totalStockUnits || 0} Units</h3>
              <span className="text-[10px] text-gray-400">Across {inventoryReport.summary.totalItems || 0} Product Models</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Out of Stock Alerts</span>
              <h3 className="text-xl font-bold text-red-500 mt-1">{inventoryReport.summary.outOfStockCount || 0} Items</h3>
              <span className="text-[10px] text-red-400">Requires Immediate Restocking</span>
            </div>

            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-2xl shadow-sm">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Low Stock Warning</span>
              <h3 className="text-xl font-bold text-amber-500 mt-1">{inventoryReport.summary.lowStockCount || 0} Items</h3>
              <span className="text-[10px] text-gray-400">Stock between 1 and 3 units</span>
            </div>
          </div>

          {/* Inventory Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-855 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                    <th className="p-4">Item Model</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Subcategory</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Units in Stock</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        No products found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.images?.[0] || '/placeholder.png'}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 border dark:border-gray-800"
                          />
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-gray-400">Slug: {p.slug}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-amber-500">{p.mainCategory}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{p.category}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{formatPrice(p.price)}</td>
                        <td className="p-4 font-mono font-bold text-sm">
                          {p.stock}
                        </td>
                        <td className="p-4 font-bold text-amber-500">
                          {formatPrice(p.stock * p.price)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            p.stock === 0 ? 'bg-red-500/10 text-red-500' : p.stock <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {p.stock === 0 ? 'Out of Stock' : p.stock <= 3 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEPARTMENT & CATEGORY PERFORMANCE */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-855 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                    <th className="p-4">Department</th>
                    <th className="p-4">Subcategories</th>
                    <th className="p-4">Registered Models</th>
                    <th className="p-4">Stock Units</th>
                    <th className="p-4">Average Price</th>
                    <th className="p-4">Stock Valuation</th>
                    <th className="p-4">Units Sold</th>
                    <th className="p-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReport.map((cat) => (
                    <tr key={cat._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="p-4 flex items-center gap-2.5">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <span className="font-bold text-amber-500 text-sm block">{cat.name}</span>
                          <span className="text-[10px] text-gray-400">Order: {cat.displayOrder}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block">{cat.subcategoriesCount} subcategories</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{cat.subcategories?.join(', ')}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{cat.totalModels} models</td>
                      <td className="p-4 font-mono font-bold text-blue-500">{cat.totalStock} units</td>
                      <td className="p-4 font-semibold text-gray-400">{formatPrice(cat.averagePrice)}</td>
                      <td className="p-4 font-bold text-purple-500">{formatPrice(cat.totalStockValue)}</td>
                      <td className="p-4 font-bold text-emerald-500">{cat.unitsSold} units</td>
                      <td className="p-4 text-right font-bold text-amber-500 text-sm">
                        {formatPrice(cat.revenueSold)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER PURCHASE INSIGHTS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-855 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Latest Order</th>
                    <th className="p-4 text-right">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        No customer records found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{cust.name}</td>
                        <td className="p-4 text-gray-400 font-mono">{cust.email}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">{cust.phoneNumber}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cust.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {cust.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-blue-500">{cust.totalOrders} orders</td>
                        <td className="p-4 text-gray-400">
                          {cust.latestOrder ? new Date(cust.latestOrder).toLocaleDateString() : 'No orders yet'}
                        </td>
                        <td className="p-4 text-right font-bold text-amber-500 text-sm">
                          {formatPrice(cust.totalSpent)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
