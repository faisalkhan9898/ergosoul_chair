import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaEdit, FaChevronDown, FaTimes } from 'react-icons/fa';
import API from '../services/api';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [description, setDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;

    setUpdating(true);
    try {
      await API.put(`/orders/${activeOrder._id}/status`, {
        status,
        description: description || `Order status updated to ${status}.`
      });
      
      setActiveOrder(null);
      setDescription('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s === 'Shipped') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s === 'Processing') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaClipboardList className="text-amber-500" />
          Orders Tracker
        </h1>
        <p className="text-[10px] text-gray-400">Total customer orders transaction lists: {orders.length}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-850 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Placed</th>
                <th className="p-4">Paid Total</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord._id} className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                  <td className="p-4 font-mono font-bold uppercase text-[10px]">{ord._id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{ord.user?.name || 'Jane Doe'}</p>
                    <span className="text-[10px] text-gray-400">{ord.user?.email}</span>
                  </td>
                  <td className="p-4 text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-amber-500">${ord.totalAmount}</td>
                  <td className="p-4 text-gray-400">{ord.paymentInfo?.method}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full border text-[9px] uppercase font-bold tracking-wider ${getStatusColor(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setActiveOrder(ord);
                        setStatus(ord.orderStatus);
                      }}
                      className="px-3.5 py-1.5 bg-gray-50 border hover:bg-gray-100 rounded-lg text-gray-600 font-bold transition-all"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Timeline modal dialog */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl w-full max-w-md p-6 relative shadow-luxury animate-scale-up">
            
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
            >
              <FaTimes />
            </button>

            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2 mb-4">
              Update Order Status
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 font-semibold">
              <div className="space-y-1">
                <span className="text-gray-400">Ship Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400">Timeline Description Log</span>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Package loaded to courier truck, tracking code sent."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-905 font-bold rounded-lg uppercase tracking-wider"
              >
                {updating ? 'Updating...' : 'Save Milestone'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
