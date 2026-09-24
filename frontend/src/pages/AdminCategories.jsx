import React, { useState, useEffect } from 'react';
import { FaLayerGroup, FaTrashAlt, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';
import ImageUploadField from '../components/ImageUploadField';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [image, setImage] = useState('');
  const [subcategories, setSubcategories] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories/admin');
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setIcon('📦');
    setImage('');
    setSubcategories('');
    setDisplayOrder('');
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
      icon,
      image: image.trim(),
      subcategories: subcategories,
      displayOrder: Number(displayOrder) || 0,
      isActive
    };

    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, payload);
        setFormSuccess('Department updated successfully!');
      } else {
        await API.post('/categories', payload);
        setFormSuccess('Department created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSelect = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setIcon(cat.icon || '📦');
    setImage(cat.image || '');
    setSubcategories(cat.subcategories.join(', '));
    setDisplayOrder(cat.displayOrder?.toString() || '0');
    setIsActive(cat.isActive);
    setFormError('');
    setFormSuccess('');
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Delete failed';
      console.error(errMsg);
      setFormError(errMsg);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await API.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err) {
      console.error(err.response?.data?.message || 'Update failed');
    }
  };

  const emojiOptions = ['🪑', '🛋️', '💻', '🚪', '🪴', '📦', '🛏️', '🪞', '🗄️', '🏠', '🪵', '🛒'];

  return (
    <div className="space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <FaLayerGroup className="text-amber-500" />
          Shop by Category & Department Master
        </h1>
        <p className="text-[10px] text-gray-400">
          Create new departments to display in <strong>'Shop by Category'</strong> on the homepage carousel, filter sidebar in Shop, and Item Master dropdowns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create/Edit Form */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 font-semibold">
          <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white border-b dark:border-gray-855 pb-2.5 flex justify-between items-center">
            <span>{editingId ? 'Edit Department' : 'Create New Department (Shop by Category)'}</span>
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
              <span>Department Name *</span>
              <input
                type="text"
                required
                placeholder="e.g. Chairs, Sofa, Lighting, Office Table"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span>Department Icon (Choose or Type)</span>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="📦"
                  className="w-12 h-9 text-center text-lg border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none font-bold"
                />
                <span className="text-[10px] text-gray-400">Custom emoji / symbol</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-9 h-9 text-lg rounded-lg border transition-all ${
                      icon === em
                        ? 'border-amber-500 bg-amber-500/10 scale-110'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-500/50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <ImageUploadField
              label="Cover Image"
              subtitle="For Homepage Carousel"
              value={image}
              onChange={setImage}
            />

            <div className="space-y-1">
              <span>Subcategories <span className="text-gray-400 text-[10px] font-normal">(comma-separated)</span></span>
              <textarea
                placeholder="e.g. Banquet Chair, Bar Chair, Stool Chair"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
                rows={3}
                className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span>Display Order</span>
                <input
                  type="number"
                  placeholder="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div className="space-y-1 flex items-end pb-1">
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Department' : 'Save Department'}
            </button>
          </form>
        </div>

        {/* Categories List */}
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
                    <th className="p-4">Order</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Subcategories</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="border-b dark:border-gray-855 hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                      <td className="p-4 font-bold text-gray-500">{cat.displayOrder}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <h4 className="font-bold text-amber-500">{cat.name}</h4>
                            {cat.image && (
                              <img
                                src={getImageUrl(cat.image)}
                                alt={cat.name}
                                className="mt-1 w-20 h-10 object-cover rounded border dark:border-gray-800"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-[250px]">
                        <button
                          onClick={() => setExpandedId(expandedId === cat._id ? null : cat._id)}
                          className="text-xs text-amber-500 hover:underline font-semibold"
                        >
                          {cat.subcategories.length} subcategories {expandedId === cat._id ? '▲' : '▼'}
                        </button>
                        {expandedId === cat._id && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cat.subcategories.map((sub, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-600 dark:text-gray-300 border dark:border-gray-700"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`flex items-center gap-1 font-semibold ${
                            cat.isActive ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {cat.isActive ? (
                            <><FaCheckCircle /> Active</>
                          ) : (
                            <><FaTimesCircle /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {confirmingId === cat._id ? (
                            <div className="flex items-center gap-2 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                              <span className="text-[10px] text-red-500 font-bold px-1">Confirm Delete?</span>
                              <button
                                onClick={() => handleDeleteConfirm(cat._id)}
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
                                onClick={() => handleEditSelect(cat)}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded border border-transparent hover:border-blue-500/10"
                                title="Edit Department"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => setConfirmingId(cat._id)}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/10"
                                title="Delete Department"
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

export default AdminCategories;
