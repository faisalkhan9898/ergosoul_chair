import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrashAlt, FaTimes, FaUpload, FaSearch, FaLayerGroup, FaThList, FaTable, FaBoxes, FaTags, FaFolderPlus } from 'react-icons/fa';
import API, { getImageUrl } from '../services/api';
import { useCurrency } from '../hooks/useCurrency';
import ImageUploadField from '../components/ImageUploadField';

export const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice, currencySymbol } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Dynamic categories from API
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [departmentsList, setDepartmentsList] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);

  // Category & Subcategory Filter States
  const [selectedDeptTab, setSelectedDeptTab] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewLayout, setViewLayout] = useState('grouped'); // 'grouped' or 'table'
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmingDeptDeleteId, setConfirmingDeptDeleteId] = useState(null);

  // Quick Department Modal States
  const [showQuickDeptModal, setShowQuickDeptModal] = useState(false);
  const [quickDeptName, setQuickDeptName] = useState('');
  const [quickDeptIcon, setQuickDeptIcon] = useState('📦');
  const [quickDeptImage, setQuickDeptImage] = useState('');
  const [quickDeptSubcategories, setQuickDeptSubcategories] = useState('');
  const [quickDeptOrder, setQuickDeptOrder] = useState('');
  const [quickDeptSubmitting, setQuickDeptSubmitting] = useState(false);
  const [quickDeptError, setQuickDeptError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [mainCategory, setMainCategory] = useState('Chairs');
  const [category, setCategory] = useState('Banquet Chair');
  const [purpose, setPurpose] = useState('Office');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');

  // Specs Fields
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('Ergosoul');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [weight, setWeight] = useState('');
  const [weightCapacity, setWeightCapacity] = useState('');
  const [armRest, setArmRest] = useState('Fixed');
  const [headRest, setHeadRest] = useState('None');
  const [reclining, setReclining] = useState('No');
  const [wheelType, setWheelType] = useState('PU Casters');
  const [warranty, setWarranty] = useState('3 Years');

  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (searchParams.get('create') === 'true') {
      handleAddInit();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      const cats = res.data.categories;
      setCategoriesData(cats);
      const map = {};
      const list = [];
      cats.forEach(c => {
        map[c.name] = c.subcategories || [];
        list.push(c.name);
      });
      setDepartmentsMap(map);
      setDepartmentsList(list);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreateQuickDept = async (e) => {
    e.preventDefault();
    if (!quickDeptName.trim()) return;
    setQuickDeptSubmitting(true);
    setQuickDeptError('');
    try {
      const res = await API.post('/categories', {
        name: quickDeptName.trim(),
        icon: quickDeptIcon || '📦',
        image: quickDeptImage.trim() || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400',
        subcategories: quickDeptSubcategories,
        displayOrder: Number(quickDeptOrder) || (departmentsList.length + 1),
        isActive: true
      });
      await fetchCategories();
      const newCatName = res.data.category.name;
      setMainCategory(newCatName);
      setCategory(res.data.category.subcategories?.[0] || '');
      setShowQuickDeptModal(false);
      setQuickDeptName('');
      setQuickDeptImage('');
      setQuickDeptSubcategories('');
    } catch (err) {
      setQuickDeptError(err.response?.data?.message || 'Failed to create department');
    } finally {
      setQuickDeptSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    try {
      await API.delete(`/categories/${deptId}`);
      await fetchCategories();
      setSelectedDeptTab('all');
      setSelectedSubcategory('all');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setConfirmingDeptDeleteId(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products', { params: { limit: 100 } });
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setPrice(prod.price);
    setOldPrice(prod.oldPrice || '');
    setMainCategory(prod.mainCategory || 'Chairs');
    setCategory(prod.category);
    setPurpose(prod.purpose);
    setStock(prod.stock);
    setDescription(prod.description);
    setLongDescription(prod.longDescription || '');

    // Specs
    setMaterial(prod.specs?.material || '');
    setColor(prod.specs?.color?.join(', ') || '');
    setBrand(prod.specs?.brand || 'Ergosoul');
    setHeight(prod.specs?.height || '');
    setWidth(prod.specs?.width || '');
    setWeight(prod.specs?.weight || '');
    setWeightCapacity(prod.specs?.weightCapacity || '');
    setArmRest(prod.specs?.armRest || 'Fixed');
    setHeadRest(prod.specs?.headRest || 'None');
    setReclining(prod.specs?.reclining || 'No');
    setWheelType(prod.specs?.wheelType || 'PU Casters');
    setWarranty(prod.warranty || '3 Years');

    setFiles([]);
    setShowForm(true);
  };

  const handleAddInit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setOldPrice('');
    setMainCategory(departmentsList[0] || 'Chairs');
    setCategory((departmentsMap[departmentsList[0]] || [])[0] || '');
    setPurpose('Office');
    setStock('10');
    setDescription('');
    setLongDescription('');

    // Specs
    setMaterial('');
    setColor('');
    setBrand('Ergosoul');
    setHeight('');
    setWidth('');
    setWeight('');
    setWeightCapacity('');
    setArmRest('Fixed');
    setHeadRest('None');
    setReclining('No');
    setWheelType('PU Casters');
    setWarranty('3 Years');

    setFiles([]);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      if (oldPrice) formData.append('oldPrice', oldPrice);
      formData.append('mainCategory', mainCategory);
      formData.append('category', category);
      formData.append('purpose', purpose);
      formData.append('stock', stock);
      formData.append('description', description);
      formData.append('longDescription', longDescription);

      // Specs
      formData.append('material', material);
      formData.append('color', color);
      formData.append('brand', brand);
      formData.append('height', height);
      formData.append('width', width);
      formData.append('weight', weight);
      formData.append('weightCapacity', weightCapacity);
      formData.append('armRest', armRest);
      formData.append('headRest', headRest);
      formData.append('reclining', reclining);
      formData.append('wheelType', wheelType);
      formData.append('warranty', warranty);

      // Files
      for (const file of files) {
        formData.append('images', file);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editingId) {
        await API.put(`/products/${editingId}`, formData, { headers });
      } else {
        await API.post('/products', formData, { headers });
      }

      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Form submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Delete product failed';
      console.error(errMsg);
      setFormError(errMsg);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Filter products by Department, Subcategory, Stock, and Search keyword
  const filteredProducts = products.filter(p => {
    if (selectedDeptTab !== 'all' && p.mainCategory !== selectedDeptTab) return false;
    if (selectedSubcategory !== 'all' && p.category !== selectedSubcategory) return false;
    if (stockFilter === 'out_of_stock' && p.stock !== 0) return false;
    if (stockFilter === 'low_stock' && (p.stock <= 0 || p.stock > 3)) return false;
    if (stockFilter === 'in_stock' && p.stock <= 0) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSlug = p.slug?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchDept = p.mainCategory?.toLowerCase().includes(q);
      const matchMat = p.specs?.material?.toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchCat && !matchDept && !matchMat) return false;
    }
    return true;
  });

  // Group products by subcategory
  const groupedBySubcategory = {};
  filteredProducts.forEach(p => {
    const sub = p.category || 'Uncategorized';
    if (!groupedBySubcategory[sub]) {
      groupedBySubcategory[sub] = [];
    }
    groupedBySubcategory[sub].push(p);
  });

  const renderProductRow = (p) => (
    <tr key={p._id} className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
      <td className="p-4 flex items-center gap-3">
        <img
          src={p.images && p.images[0] ? p.images[0] : '/placeholder.png'}
          alt={p.name}
          className="w-11 h-11 object-cover rounded-lg bg-gray-150 border dark:border-gray-800"
        />
        <div>
          <h4 className="font-serif font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</h4>
          <span className="text-[10px] text-gray-400 font-mono">Slug: {p.slug}</span>
        </div>
      </td>
      <td className="p-4">
        <span className="font-bold text-amber-500 block">{p.mainCategory}</span>
        <span className="text-[10px] text-gray-600 dark:text-gray-300 font-semibold">{p.category}</span>
      </td>
      <td className="p-4 font-bold text-gray-900 dark:text-white text-sm">{formatPrice(p.price)}</td>
      <td className="p-4 font-semibold">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
          p.stock === 0 ? 'bg-red-500/10 text-red-500' : p.stock <= 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
        </span>
      </td>
      <td className="p-4 text-gray-400">
        <span className="block text-gray-700 dark:text-gray-300 font-medium">{p.specs?.material || 'Standard'}</span>
        <span className="text-[10px] text-gray-400">{p.purpose || 'Office'}</span>
      </td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {confirmingId === p._id ? (
            <div className="flex items-center gap-1.5 bg-red-500/10 p-1 rounded-lg border border-red-500/20">
              <span className="text-[9px] text-red-500 font-bold px-1">Delete?</span>
              <button
                onClick={() => handleDeleteConfirm(p._id)}
                className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-[9px] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded text-[9px]"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleEditInit(p)}
                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg border border-transparent hover:border-blue-500/20 transition-colors"
                title="Edit item specifications"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => setConfirmingId(p._id)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors"
                title="Delete product item"
              >
                <FaTrashAlt />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-2">
            <FaBoxes className="text-amber-500" />
            Item Master Creation & Catalog
          </h1>
          <p className="text-[10px] text-gray-400">
            Total registered items: <strong className="text-gray-200">{products.length}</strong> • Showing: <strong className="text-amber-500">{filteredProducts.length}</strong>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQuickDeptModal(true)}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex items-center gap-1.5 border dark:border-gray-700 uppercase tracking-wider text-[11px] transition-colors"
            title="Create a new Department & Shop by Category tile"
          >
            <FaFolderPlus className="text-amber-500" /> + Add Department (Category)
          </button>
          <Link
            to="/admin/categories"
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl flex items-center gap-1.5 border dark:border-gray-700 uppercase tracking-wider text-[11px] transition-colors"
          >
            <FaLayerGroup className="text-amber-500" /> Category Master
          </Link>
          <button
            onClick={handleAddInit}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl flex items-center gap-2 shadow-sm uppercase tracking-wider text-[11px] transition-colors"
          >
            <FaPlus /> Create New Item Master
          </button>
        </div>
      </div>

      {/* 1. Department Tabs */}
      <div className="flex border-b dark:border-gray-800 gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedDeptTab('all');
            setSelectedSubcategory('all');
          }}
          className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 text-xs transition-all whitespace-nowrap border-b-2 ${
            selectedDeptTab === 'all'
              ? 'border-amber-500 text-amber-500 bg-amber-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-50/5'
          }`}
        >
          <FaBoxes />
          All Departments ({products.length})
        </button>
        {departmentsList.map(dept => {
          const catObj = categoriesData.find(c => c.name === dept);
          const count = products.filter(p => p.mainCategory === dept).length;
          return (
            <button
              key={dept}
              onClick={() => {
                setSelectedDeptTab(dept);
                setSelectedSubcategory('all');
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold flex items-center gap-2 text-xs transition-all whitespace-nowrap border-b-2 ${
                selectedDeptTab === dept
                  ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-50/5'
              }`}
            >
              <span>{catObj?.icon || '📦'}</span>
              <span>{dept} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Selected Department Action / Delete Banner */}
      {selectedDeptTab !== 'all' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {categoriesData.find(c => c.name === selectedDeptTab)?.icon || '📦'}
            </span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-xs flex items-center gap-2">
                Active Department: <span className="text-amber-500 font-serif text-sm font-bold">{selectedDeptTab}</span>
              </h3>
              <span className="text-[10px] text-gray-400">
                {products.filter(p => p.mainCategory === selectedDeptTab).length} models registered in this department
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(() => {
              const activeCatObj = categoriesData.find(c => c.name === selectedDeptTab);
              if (!activeCatObj) return null;
              return confirmingDeptDeleteId === activeCatObj._id ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-red-500 font-bold">
                    Permanently delete "{selectedDeptTab}"?
                  </span>
                  <button
                    onClick={() => handleDeleteDepartment(activeCatObj._id)}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-[10px] transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setConfirmingDeptDeleteId(null)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDeptDeleteId(activeCatObj._id)}
                  className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title={`Delete ${selectedDeptTab} department`}
                >
                  <FaTrashAlt className="text-[10px]" />
                  Delete Department
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. Subcategory Filter Chips Bar */}
      {selectedDeptTab !== 'all' && departmentsMap[selectedDeptTab] && (
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border dark:border-gray-800">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
            <FaTags className="text-amber-500" /> Subcategory:
          </span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedSubcategory === 'all'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:border-amber-500'
            }`}
          >
            All {selectedDeptTab} ({products.filter(p => p.mainCategory === selectedDeptTab).length})
          </button>
          {departmentsMap[selectedDeptTab].map(sub => {
            const subCount = products.filter(p => p.mainCategory === selectedDeptTab && p.category === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedSubcategory === sub
                    ? 'bg-amber-500 text-gray-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 hover:border-amber-500'
                }`}
              >
                <span>{sub}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSubcategory === sub ? 'bg-black/20 text-black font-bold' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  {subCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Search & Layout Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 shadow-sm">
        <div className="flex-1 max-w-sm relative">
          <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search model name, slug, material..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="p-2 border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none text-xs font-semibold"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (1-3 units)</option>
            <option value="out_of_stock">Out of Stock (0 units)</option>
          </select>

          <div className="flex items-center border dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 p-0.5">
            <button
              onClick={() => setViewLayout('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'grouped'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Group products by Subcategory"
            >
              <FaThList />
              Grouped
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'table'
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Standard Single Table"
            >
              <FaTable />
              Flat List
            </button>
          </div>
        </div>
      </div>

      {/* 4. Product Catalog Presentation */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-sm font-semibold">No items found matching the selected Category / Subcategory.</p>
          <button
            onClick={() => {
              setSelectedDeptTab('all');
              setSelectedSubcategory('all');
              setSearchKeyword('');
              setStockFilter('all');
            }}
            className="mt-3 text-xs text-amber-500 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : viewLayout === 'grouped' ? (
        /* Grouped by Subcategory View */
        <div className="space-y-6">
          {Object.entries(groupedBySubcategory).map(([subcatName, items]) => (
            <div key={subcatName} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-850 px-5 py-3 border-b dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white">
                    {subcatName}
                  </h3>
                  <span className="text-[10px] bg-gray-200 dark:bg-gray-750 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold">
                    {items.length} {items.length === 1 ? 'model' : 'models'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {items[0]?.mainCategory}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-gray-850 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50 text-[10px]">
                      <th className="p-4">Item Model</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Material / Purpose</th>
                      <th className="p-4 text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => renderProductRow(p))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat List Table View */
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-850 text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-850 text-[10px]">
                <th className="p-4">Item Model</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Material / Purpose</th>
                <th className="p-4 text-center">Controls</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => renderProductRow(p))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto shadow-luxury animate-scale-up">
            
            {/* Close */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
            >
              <FaTimes className="text-sm" />
            </button>

            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white border-b dark:border-gray-850 pb-3 mb-6">
              {editingId ? `Modify ${mainCategory || 'Item'} Specifications` : `List New ${mainCategory || 'Item'}`}
            </h3>

            {formError && <p className="text-red-500 font-semibold mb-4 text-center">{formError}</p>}

            <form onSubmit={handleFormSubmit} className="space-y-6 font-semibold">
              
              {/* Row 1: Brief specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-gray-400">{mainCategory ? `${mainCategory} Model Name` : 'Item Model Name'}</span>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${mainCategory === 'Sofa' ? 'Royal Velvet Chesterfield Sofa' : mainCategory === 'Office Table' ? 'Apex Motorized Standing Desk' : mainCategory === 'Wardrobe' ? '2-Door Sliding Wardrobe' : mainCategory === 'Furniture' ? 'Elysian Platform Bed' : 'AeroFlex Ergonomic Mesh Task Chair'}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Department</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickDeptModal(true)}
                      className="text-[10px] text-amber-500 hover:underline font-bold flex items-center gap-1"
                    >
                      <FaPlus className="text-[8px]" /> New Department
                    </button>
                  </div>
                  <select
                    value={mainCategory}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setMainCategory(newDept);
                      const subs = departmentsMap[newDept] || [];
                      setCategory(subs[0] || '');
                    }}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-semibold"
                  >
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400">Subcategory</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    {(departmentsMap[mainCategory] || []).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Usage Purpose</span>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Study">Study</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Waiting Area">Waiting Area</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Pricing and stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-gray-400">Retail Price ({currencySymbol})</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold select-none text-sm pointer-events-none">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      required
                      placeholder={`e.g. ${currencySymbol === '₹' ? '14999' : '199'}`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Old Price Slashed ({currencySymbol} - Optional)</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold select-none text-sm pointer-events-none">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder={`e.g. ${currencySymbol === '₹' ? '19999' : '249'}`}
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full pl-8 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Units in Stock</span>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Technical Specifications */}
              <div className="space-y-3 pt-4 border-t dark:border-gray-850">
                <h4 className="font-serif font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Technical specifications</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span>Frame Material</span>
                    <input type="text" placeholder="e.g. White Oak Wood" required value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Colors (Comma separated)</span>
                    <input type="text" placeholder="e.g. Black, Grey, Blue" required value={color} onChange={e => setColor(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Seat Height</span>
                    <input type="text" placeholder="e.g. 105 - 118 cm" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Seat Width</span>
                    <input type="text" placeholder="e.g. 64 cm" value={width} onChange={e => setWidth(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Load Capacity</span>
                    <input type="text" placeholder="e.g. 150 kg" value={weightCapacity} onChange={e => setWeightCapacity(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Arm Rest Type</span>
                    <select value={armRest} onChange={e => setArmRest(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-semibold">
                      <option value="4D Fully Adjustable">4D Adjustable</option>
                      <option value="3D Adjustable">3D Adjustable</option>
                      <option value="Fixed Chrome">Fixed</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span>Head Rest Support</span>
                    <select value={headRest} onChange={e => setHeadRest(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-semibold">
                      <option value="Adjustable Mesh">Adjustable Support</option>
                      <option value="Integrated Leather Cushion">Integrated Cushion</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span>Warranty</span>
                    <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Brand Name</span>
                    <input type="text" placeholder="e.g. Ergosoul" value={brand} onChange={e => setBrand(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Item Weight</span>
                    <input type="text" placeholder="e.g. 18 kg" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <span>Reclining Support</span>
                    <select value={reclining} onChange={e => setReclining(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-semibold">
                      <option value="Yes (90° - 135°)">Yes (90° - 135°)</option>
                      <option value="Yes (90° - 150°)">Yes (90° - 150°)</option>
                      <option value="Yes (Tilt Tension)">Yes (Tilt Tension)</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span>Wheel Casters Type</span>
                    <select value={wheelType} onChange={e => setWheelType(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-semibold">
                      <option value="PU Casters">PU Casters</option>
                      <option value="Nylon Casters">Nylon Casters</option>
                      <option value="Heavy-Duty Mute Wheels">Heavy-Duty Mute Wheels</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Descriptions */}
              <div className="space-y-4 pt-4 border-t dark:border-gray-850">
                <div className="space-y-1">
                  <span className="text-gray-400">Brief Marketing Description</span>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Long Description (Tab Comfort specs)</span>
                  <textarea
                    rows="3"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Images Upload */}
              <div className="space-y-2 pt-4 border-t dark:border-gray-855">
                <span className="text-gray-400 block mb-1">{mainCategory || 'Item'} Images (Max 5 file uploads)</span>
                <label className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-950 flex flex-col items-center gap-2 transition-colors">
                  <FaUpload className="text-amber-500 text-lg animate-bounce" />
                  <span>Choose JPG/PNG files to upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {files.length > 0 && (
                  <p className="text-[10px] text-green-500 font-semibold">{files.length} files selected for upload</p>
                )}
              </div>

              {/* Actions footer */}
              <div className="border-t dark:border-gray-850 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl flex items-center justify-center min-w-[100px]"
                >
                  {submitting ? 'Submitting...' : editingId ? `Update ${mainCategory || 'Item'}` : `Save ${mainCategory || 'Item'}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quick Add Department (Category) Modal */}
      {showQuickDeptModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 relative shadow-luxury animate-scale-up">
            <button
              onClick={() => setShowQuickDeptModal(false)}
              className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
            >
              <FaTimes className="text-sm" />
            </button>

            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white border-b dark:border-gray-800 pb-3 mb-4 flex items-center gap-2">
              <FaFolderPlus className="text-amber-500" />
              Add New Department (Shop by Category)
            </h3>

            {quickDeptError && <p className="text-red-500 font-semibold mb-3 text-xs">{quickDeptError}</p>}

            <form onSubmit={handleCreateQuickDept} className="space-y-4 font-semibold text-xs">
              <div className="space-y-1">
                <span>Department Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lighting, Dining Sets, Decor"
                  value={quickDeptName}
                  onChange={(e) => setQuickDeptName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <span>Department Icon</span>
                <div className="flex flex-wrap gap-2">
                  {['🪑', '🛋️', '💻', '🚪', '🪴', '💡', '📦', '🛏️', '🪞', '🗄️', '🏠', '🪵'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setQuickDeptIcon(em)}
                      className={`w-8 h-8 text-base rounded-lg border transition-all ${
                        quickDeptIcon === em
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
                value={quickDeptImage}
                onChange={setQuickDeptImage}
              />

              <div className="space-y-1">
                <span>Subcategories (Comma separated)</span>
                <textarea
                  placeholder="e.g. Table Lamp, Floor Lamp, Ceiling Light, Wall Sconce"
                  value={quickDeptSubcategories}
                  onChange={(e) => setQuickDeptSubcategories(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none resize-none text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowQuickDeptModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickDeptSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl"
                >
                  {quickDeptSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>

            {/* List of Existing Departments with Delete Option */}
            <div className="mt-6 pt-4 border-t dark:border-gray-800 space-y-2.5">
              <span className="text-gray-400 font-bold text-[11px] block uppercase tracking-wider">
                Existing Departments ({categoriesData.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {categoriesData.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl border dark:border-gray-700/50"
                  >
                    <div className="flex items-center gap-2">
                      {cat.image ? (
                        <img
                          src={getImageUrl(cat.image)}
                          alt={cat.name}
                          className="w-8 h-8 rounded-lg object-cover border dark:border-gray-750 flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-base">{cat.icon}</span>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white text-xs">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 block">
                          {cat.subcategories?.length || 0} subcategories
                        </span>
                      </div>
                    </div>

                    <div>
                      {confirmingDeptDeleteId === cat._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(cat._id)}
                            className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-[9px]"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeptDeleteId(null)}
                            className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded text-[9px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingDeptDeleteId(cat._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={`Delete ${cat.name}`}
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
