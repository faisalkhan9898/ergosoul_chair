import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaGlobe, FaTrashAlt, FaEdit, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import API from '../services/api';
import { fetchActiveCurrencies, setSelectedCurrency } from '../redux/slices/currencySlice';

const PREDEFINED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', defaultRate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', defaultRate: 0.92 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', defaultRate: 83.0 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', defaultRate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', defaultRate: 150.0 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', defaultRate: 1.35 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', defaultRate: 1.50 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)', defaultRate: 3.67 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (CNY)', defaultRate: 7.20 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD)', defaultRate: 1.34 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', defaultRate: 0.90 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (ZAR)', defaultRate: 18.5 }
];

export const AdminCurrencies = () => {
  const dispatch = useDispatch();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [code, setCode] = useState('');
  const [symbol, setSymbol] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await API.get('/currencies/admin');
      setCurrencies(res.data.currencies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode('');
    setSymbol('');
    setExchangeRate('');
    setIsDefault(false);
    setIsActive(true);
    setEditingId(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    const payload = {
      code: code.trim().toUpperCase(),
      symbol: symbol.trim(),
      exchangeRate: Number(exchangeRate),
      isDefault,
      isActive
    };

    try {
      if (editingId) {
        const res = await API.put(`/currencies/${editingId}`, payload);
        setFormSuccess('Currency updated successfully!');
        if (isDefault) {
          dispatch(setSelectedCurrency(res.data.currency || payload));
        }
      } else {
        const res = await API.post('/currencies', payload);
        setFormSuccess('Currency created successfully!');
        if (isDefault) {
          dispatch(setSelectedCurrency(res.data.currency || payload));
        }
      }
      resetForm();
      fetchCurrencies();
      dispatch(fetchActiveCurrencies());
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSelect = (curr) => {
    setEditingId(curr._id);
    setCode(curr.code);
    setSymbol(curr.symbol);
    setExchangeRate(curr.exchangeRate.toString());
    setIsDefault(curr.isDefault);
    setIsActive(curr.isActive);
    setFormError('');
    setFormSuccess('');
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await API.delete(`/currencies/${id}`);
      fetchCurrencies();
      dispatch(fetchActiveCurrencies());
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Delete failed';
      console.error(errMsg);
      setFormError(errMsg);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSetDefault = async (curr) => {
    try {
      const res = await API.put(`/currencies/${curr._id}`, { ...curr, isDefault: true });
      fetchCurrencies();
      dispatch(setSelectedCurrency(res.data.currency || { ...curr, isDefault: true }));
      dispatch(fetchActiveCurrencies());
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleActive = async (curr) => {
    try {
      await API.put(`/currencies/${curr._id}`, { ...curr, isActive: !curr.isActive });
      fetchCurrencies();
      dispatch(fetchActiveCurrencies());
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaGlobe className="text-amber-500" />
          Currency Master
        </h1>
        <p className="text-[10px] text-gray-400">Manage showroom currencies and exchange rates (relative to USD base).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create/Edit Form */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 font-semibold">
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2.5 flex justify-between items-center">
            <span>{editingId ? 'Edit Currency' : 'Add Currency'}</span>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-amber-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </h3>

          {formError && <p className="text-red-500 font-semibold">{formError}</p>}
          {formSuccess && <p className="text-green-500 font-semibold">{formSuccess}</p>}

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            {editingId ? (
              // Edit Mode: Static read-only indicators
              <div className="bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border dark:border-gray-800 space-y-1.5">
                <p className="text-gray-400">Editing Currency Code:</p>
                <p className="text-base font-bold text-amber-500">{code}</p>
                <p className="text-gray-400">Symbol: <span className="text-gray-700 dark:text-white font-bold">{symbol}</span></p>
              </div>
            ) : (
              // Create Mode: Searchable input datalist
              <>
                <div className="space-y-1">
                  <span>Search or Enter Currency Code (ISO)</span>
                  <input
                    list="presets-datalist"
                    required
                    placeholder="Type to search e.g. JPY, INR, CAD..."
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCode(val);
                      const matched = PREDEFINED_CURRENCIES.find(c => c.code === val);
                      if (matched) {
                        setSymbol(matched.symbol);
                        setExchangeRate(matched.defaultRate.toString());
                      }
                    }}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none font-bold uppercase"
                  />
                  <datalist id="presets-datalist">
                    {PREDEFINED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.symbol})
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Show Symbol input only if the entered code is NOT a predefined preset */}
                {PREDEFINED_CURRENCIES.some(c => c.code === code) ? (
                  <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg text-[10px] text-green-500 font-semibold flex items-center justify-between">
                    <span>Auto-filled Symbol:</span>
                    <span className="text-sm font-bold">{symbol}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span>Symbol</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <span>Exchange Rate (1 USD = ?)</span>
              <input
                type="number"
                step="0.0001"
                required
                placeholder="e.g. 83.00"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>Set as Default</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>Active</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Currency' : 'Save Currency'}
            </button>
          </form>
        </div>

        {/* Currency List */}
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
                    <th className="p-4">Currency Code</th>
                    <th className="p-4">Symbol</th>
                    <th className="p-4">Rate (to USD)</th>
                    <th className="p-4">Default</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((curr) => (
                    <tr key={curr._id} className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="p-4 font-mono font-bold text-amber-500">{curr.code}</td>
                      <td className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{curr.symbol}</td>
                      <td className="p-4 font-semibold text-gray-700 dark:text-gray-250">{curr.exchangeRate}</td>
                      <td className="p-4">
                        {curr.isDefault ? (
                          <span className="flex items-center gap-1 text-green-500 font-bold">
                            <FaStar /> Default Base
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(curr)}
                            className="text-xs text-amber-500 hover:underline font-semibold"
                          >
                            Set Default
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(curr)}
                          disabled={curr.isDefault}
                          className={`flex items-center gap-1 font-semibold ${
                            curr.isActive ? 'text-green-500' : 'text-red-500'
                          } disabled:opacity-50`}
                          title={curr.isDefault ? "Cannot deactivate default currency" : "Toggle Active Status"}
                        >
                          {curr.isActive ? (
                            <>
                              <FaCheckCircle /> Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {confirmingId === curr._id ? (
                            <div className="flex items-center gap-2 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                              <span className="text-[10px] text-red-500 font-bold px-1">Confirm Delete?</span>
                              <button
                                onClick={() => handleDeleteConfirm(curr._id)}
                                className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                className="px-2.5 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded text-[10px] hover:bg-gray-300 dark:hover:bg-gray-750 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditSelect(curr)}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/10"
                                title="Edit Exchange Rate/Details"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => setConfirmingId(curr._id)}
                                disabled={curr.isDefault}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/10 disabled:opacity-30"
                                title={curr.isDefault ? "Cannot delete default currency" : "Delete Currency"}
                              >
                                <FaTrashAlt />
                              </button>
                            </>
                          )}
                        </div>
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

export default AdminCurrencies;
