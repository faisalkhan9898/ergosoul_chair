import React, { useState, useEffect } from 'react';
import { FaPercentage, FaTrashAlt, FaEdit, FaCheckCircle, FaTimesCircle, FaStar } from 'react-icons/fa';
import API from '../services/api';

export const AdminTaxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/taxes/admin');
      setTaxes(res.data.taxes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setRate('');
    setDescription('');
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
      name: name.trim(),
      rate: Number(rate),
      description: description.trim(),
      isDefault,
      isActive
    };

    try {
      if (editingId) {
        await API.put(`/taxes/${editingId}`, payload);
        setFormSuccess('Tax updated successfully!');
      } else {
        await API.post('/taxes', payload);
        setFormSuccess('Tax created successfully!');
      }
      resetForm();
      fetchTaxes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSelect = (tax) => {
    setEditingId(tax._id);
    setName(tax.name);
    setRate(tax.rate.toString());
    setDescription(tax.description || '');
    setIsDefault(tax.isDefault);
    setIsActive(tax.isActive);
    setFormError('');
    setFormSuccess('');
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await API.delete(`/taxes/${id}`);
      fetchTaxes();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Delete failed';
      console.error(errMsg);
      setFormError(errMsg);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSetDefault = async (tax) => {
    try {
      await API.put(`/taxes/${tax._id}`, { ...tax, isDefault: true });
      fetchTaxes();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleActive = async (tax) => {
    try {
      await API.put(`/taxes/${tax._id}`, { ...tax, isActive: !tax.isActive });
      fetchTaxes();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaPercentage className="text-amber-500" />
          Tax Master
        </h1>
        <p className="text-[10px] text-gray-400">Manage showroom tax categories and percentage rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create/Edit Form */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 font-semibold">
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white border-b dark:border-gray-855 pb-2.5 flex justify-between items-center">
            <span>{editingId ? 'Edit Tax Rate' : 'Add Tax Rate'}</span>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-amber-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </h3>

          {formError && <p className="text-red-500 font-semibold">{formError}</p>}
          {formSuccess && <p className="text-green-500 font-semibold">{formSuccess}</p>}

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="space-y-1">
              <span>Tax Name</span>
              <input
                type="text"
                required
                placeholder="e.g. Standard GST, VAT"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span>Tax Rate (%)</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 18.00"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span>Description</span>
              <input
                type="text"
                placeholder="Brief description of when this tax applies"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? 'Saving...' : editingId ? 'Update Tax' : 'Save Tax'}
            </button>
          </form>
        </div>

        {/* Tax List */}
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
                    <th className="p-4">Tax Name</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Default</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {taxes.map((tax) => (
                    <tr key={tax._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="p-4 font-bold text-amber-500">{tax.name}</td>
                      <td className="p-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{tax.rate}%</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={tax.description}>{tax.description || '-'}</td>
                      <td className="p-4">
                        {tax.isDefault ? (
                          <span className="flex items-center gap-1 text-green-500 font-bold">
                            <FaStar /> Default Base
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(tax)}
                            className="text-xs text-amber-500 hover:underline font-semibold"
                          >
                            Set Default
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(tax)}
                          disabled={tax.isDefault}
                          className={`flex items-center gap-1 font-semibold ${
                            tax.isActive ? 'text-green-500' : 'text-red-500'
                          } disabled:opacity-50`}
                          title={tax.isDefault ? "Cannot deactivate default tax" : "Toggle Active Status"}
                        >
                          {tax.isActive ? (
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
                          {confirmingId === tax._id ? (
                            <div className="flex items-center gap-2 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                              <span className="text-[10px] text-red-500 font-bold px-1">Confirm Delete?</span>
                              <button
                                onClick={() => handleDeleteConfirm(tax._id)}
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
                                onClick={() => handleEditSelect(tax)}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/10"
                                title="Edit Tax Rate/Details"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => setConfirmingId(tax._id)}
                                disabled={tax.isDefault}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/10 disabled:opacity-30"
                                title={tax.isDefault ? "Cannot delete default tax" : "Delete Tax"}
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

export default AdminTaxes;
