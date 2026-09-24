import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaTrashAlt } from 'react-icons/fa';
import API from '../services/api';
import { useCurrency } from '../hooks/useCurrency';

export const AdminCoupons = () => {
  const { currencySymbol, formatPrice } = useCurrency();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/coupons');
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await API.post('/coupons', {
        code,
        discountType,
        discountAmount: Number(discountAmount),
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        expiresAt: new Date(expiresAt)
      });

      setCode('');
      setDiscountAmount('');
      setMinPurchase('');
      setExpiresAt('');
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Create coupon failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    let proceed = true;
    try {
      proceed = window.confirm('Delete this coupon permanently?');
    } catch (e) {
      console.warn('Confirm dialog blocked, proceeding with deletion:', e.message);
    }
    if (!proceed) return;

    try {
      await API.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Delete coupon failed';
      console.error(errMsg);
      try {
        alert(errMsg);
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaTicketAlt className="text-amber-500" />
          Coupons Manager
        </h1>
        <p className="text-[10px] text-gray-400">Add marketing codes or flat rate discounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Form */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 font-semibold">
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2.5">
            Add Promotional Coupon
          </h3>

          {formError && <p className="text-red-500 font-semibold">{formError}</p>}

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="space-y-1">
              <span>Coupon Code</span>
              <input
                type="text"
                required
                placeholder="e.g. SUMMER25"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none uppercase font-bold"
              />
            </div>

            <div className="space-y-1">
              <span>Discount Type</span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Value ({currencySymbol})</option>
              </select>
            </div>

            <div className="space-y-1">
              <span>Discount Rate</span>
              <input
                type="number"
                required
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span>Min Purchase ({currencySymbol} - Optional)</span>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span>Expiration Date</span>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
              {submitting ? 'Creating...' : 'Save Coupon'}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-855 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Min Purchase</th>
                    <th className="p-4">Expires</th>
                    <th className="p-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id} className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="p-4 font-mono font-bold uppercase text-amber-500">{c.code}</td>
                      <td className="p-4 font-semibold text-gray-700 dark:text-gray-200">
                        {c.discountAmount}
                        {c.discountType === 'percentage' ? '%' : ` ${currencySymbol}`}
                      </td>
                      <td className="p-4 text-gray-400">
                        {c.minPurchase ? `${currencySymbol}${c.minPurchase}` : '-'}
                      </td>
                      <td className="p-4 text-gray-400">{new Date(c.expiresAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/10"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
