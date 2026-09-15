import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import VoiceSearch from '../components/VoiceSearch';
import { FaSlidersH, FaSearch, FaTimes } from 'react-icons/fa';
import { useCurrency } from '../hooks/useCurrency';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCurrency } = useCurrency();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pages, setPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [departmentsList, setDepartmentsList] = useState([]);

  // Parse filters from URL
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const mainCategory = searchParams.get('mainCategory') || '';
  const category = searchParams.get('category') || '';
  const purpose = searchParams.get('purpose') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const material = searchParams.get('material') || '';
  const color = searchParams.get('color') || '';
  const rating = searchParams.get('rating') || '';
  const armRest = searchParams.get('armRest') || '';
  const headRest = searchParams.get('headRest') || '';
  const reclining = searchParams.get('reclining') || '';
  const wheelType = searchParams.get('wheelType') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await API.get('/categories');
        const map = {};
        const list = [];
        res.data.categories.forEach(c => {
          map[c.name] = c.subcategories || [];
          list.push(c.name);
        });
        setDepartmentsMap(map);
        setDepartmentsList(list);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Filter Categories arrays dynamically based on department
  const activeCategories = mainCategory
    ? (departmentsMap[mainCategory] || [])
    : Object.values(departmentsMap).flat();
  const purposesList = ['Home', 'Office', 'Gaming', 'Study', 'Restaurant', 'Cafe', 'Hospital', 'School', 'Hotel', 'Waiting Area'];
  const materialsList = ['Premium Elastomeric Mesh', 'Top Grain Italian Leather', 'Carbon-Fiber PU Leather', 'Solid White Oak & Linen', 'Fiberglass Resin Polypropylene', 'Nylon Polymer & Density Foam', 'Chrome Frame & Elastic Mesh', 'Premium Velvet & Brass', 'Wrought Iron & Distressed Pine', 'Carbon Steel & Vinyl', 'Sanitizable Medical Vinyl & Steel'];
  const colorsList = ['Black', 'Grey', 'White', 'Blue', 'Yellow', 'Red', 'Brown', 'Green', 'Beige', 'Sand', 'Orange'];

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        // Collect params for API
        const apiParams = {
          page,
          limit: 9,
          sort
        };

        if (search) apiParams.search = search;
        if (mainCategory) apiParams.mainCategory = mainCategory;
        if (category) apiParams.category = category;
        if (purpose) apiParams.purpose = purpose;
        if (minPrice) apiParams.minPrice = minPrice;
        if (maxPrice) apiParams.maxPrice = maxPrice;
        if (material) apiParams.material = material;
        if (color) apiParams.color = color;
        if (rating) apiParams.rating = rating;
        if (armRest) apiParams.armRest = armRest;
        if (headRest) apiParams.headRest = headRest;
        if (reclining) apiParams.reclining = reclining;
        if (wheelType) apiParams.wheelType = wheelType;

        const response = await API.get('/products', { params: apiParams });
        setProducts(response.data.products);
        setTotalProducts(response.data.total);
        setPages(response.data.pages);
      } catch (err) {
        console.error('Failed to load shop items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [searchParams]);

  const updateParam = (keyOrObj, value) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', '1'); // reset to page 1 on filter
    if (typeof keyOrObj === 'object' && keyOrObj !== null) {
      Object.entries(keyOrObj).forEach(([k, v]) => {
        if (v) {
          nextParams.set(k, v);
        } else {
          nextParams.delete(k);
        }
      });
    } else {
      if (value) {
        nextParams.set(keyOrObj, value);
      } else {
        nextParams.delete(keyOrObj);
      }
    }
    setSearchParams(nextParams);
  };

  const handleClearAll = () => {
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleVoiceSearch = (text) => {
    updateParam('search', text);
  };

  const renderFilterSidebar = (isMobile = false) => {
    return (
      <div className="space-y-7 pr-4 font-sans text-sm">
        {/* Active Filters Clear Button */}
        {!isMobile && (
          <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <FaSlidersH className="text-xs text-amber-500" />
              Seating Filters
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-all"
            >
              Reset
            </button>
          </div>
        )}

        {/* Department Selection */}
        <div className="space-y-2.5">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400">Department</label>
          <select
            value={mainCategory}
            onChange={(e) => {
              updateParam({
                mainCategory: e.target.value,
                category: ''
              });
            }}
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
          >
            <option value="">All Departments</option>
            {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Subcategories (Category) */}
        <div className="space-y-2.5">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400">Subcategory</label>
          <select
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Subcategories</option>
            {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Purpose */}
        <div className="space-y-2.5">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400">Usage Purpose</label>
          <select
            value={purpose}
            onChange={(e) => updateParam('purpose', e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Purposes</option>
            {purposesList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Price limits */}
        <div className="space-y-2.5">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400">Price Limit ({selectedCurrency?.symbol || '$'})</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => updateParam('minPrice', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-center"
            />
            <span className="text-gray-300">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-center"
            />
          </div>
        </div>

        {/* Material specs */}
        <div className="space-y-2.5">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400">Seat Material</label>
          <select
            value={material}
            onChange={(e) => updateParam('material', e.target.value)}
            className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Materials</option>
            {materialsList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400 block mb-1">Color Palette</label>
          <div className="flex flex-wrap gap-1.5">
            {colorsList.map((c) => {
              const isActive = color === c;
              return (
                <button
                  key={c}
                  onClick={() => updateParam('color', isActive ? '' : c)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    isActive
                      ? 'bg-primary dark:bg-amber-500 text-white dark:text-gray-900 border-primary dark:border-amber-400 font-medium'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Adjustments: Armrest, headrest, reclining */}
        <div className="space-y-4 pt-2 border-t dark:border-gray-800">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400 block">Ergonomic Adjustments</label>
          
          {/* Armrest */}
          <div className="space-y-1">
            <span className="text-xs text-gray-400">Arm Rest</span>
            <select
              value={armRest}
              onChange={(e) => updateParam('armRest', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-850 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200"
            >
              <option value="">Any Arm Rest</option>
              <option value="4D Fully Adjustable">4D Adjustable</option>
              <option value="3D Adjustable">3D Adjustable</option>
              <option value="Fixed Chrome">Fixed</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Headrest */}
          <div className="space-y-1">
            <span className="text-xs text-gray-400">Head Rest</span>
            <select
              value={headRest}
              onChange={(e) => updateParam('headRest', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-850 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200"
            >
              <option value="">Any Head Rest</option>
              <option value="Adjustable Mesh">Adjustable</option>
              <option value="Integrated Leather Cushion">Integrated</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* Reclining */}
          <div className="space-y-1">
            <span className="text-xs text-gray-400">Reclining Options</span>
            <select
              value={reclining}
              onChange={(e) => updateParam('reclining', e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-850 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200"
            >
              <option value="">Any Reclining</option>
              <option value="Yes (90° - 135°)">Reclining (Up to 135°)</option>
              <option value="Yes (90° - 165°)">Deep Reclining (Up to 165°)</option>
              <option value="No">No Reclining</option>
            </select>
          </div>
        </div>

        {/* Customer Rating */}
        <div className="space-y-2">
          <label className="font-semibold text-xs tracking-wider uppercase text-gray-400 block">Rating Threshold</label>
          <div className="flex flex-col gap-1.5">
            {[4, 3].map((val) => (
              <button
                key={val}
                onClick={() => updateParam('rating', rating === val.toString() ? '' : val.toString())}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  rating === val.toString()
                    ? 'bg-amber-500 border-amber-400 text-gray-900 font-bold'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{val}.0+ Stars</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header with Search and Active stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold">Luxury Showroom</h1>
          <p className="text-xs text-gray-400 mt-1">Discovering {totalProducts} premium models matching your specifications</p>
        </div>

        {/* Search bar inside Catalog */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search specs, fabrics..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-full text-xs outline-none bg-gray-50 focus:bg-white focus:border-amber-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3.5 top-3 text-gray-400 text-[11px]" />
          </div>
          <VoiceSearch onTranscript={handleVoiceSearch} />
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2.5 bg-primary dark:bg-amber-500 text-white dark:text-gray-900 rounded-full text-sm"
            title="Filter panel"
          >
            <FaSlidersH />
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* 1. FILTER SIDEBAR (Desktop) */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-premium shrink-0">
          {renderFilterSidebar()}
        </aside>

        {/* 2. PRODUCT GRID CONTAINER */}
        <div className="flex-grow space-y-8">
          {/* Sorter Selector bar */}
          <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-800">
            <span className="text-xs text-gray-500 font-medium">Page {page} of {pages}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Sort By</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="p-1.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-xs font-semibold dark:text-white"
              >
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Popularity</option>
              </select>
            </div>
          </div>

          {/* Grids mapping */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed dark:border-gray-800 space-y-4">
              <span className="text-5xl block">🪑</span>
              <h3 className="font-serif text-lg font-bold text-gray-700 dark:text-gray-200">No Seating Found</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">No models matched those parameters. Try resetting filters or adjust price values.</p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-semibold dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <button
                onClick={() => updateParam('page', (Number(page) - 1).toString())}
                disabled={page === '1'}
                className="px-4 py-2 border rounded-full text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                Previous
              </button>
              
              {[...Array(pages)].map((_, idx) => {
                const pNum = idx + 1;
                const active = page === pNum.toString();
                return (
                  <button
                    key={pNum}
                    onClick={() => updateParam('page', pNum.toString())}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                      active
                        ? 'bg-secondary text-gray-900 border border-secondary shadow-glow'
                        : 'border hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => updateParam('page', (Number(page) + 1).toString())}
                disabled={page === pages.toString()}
                className="px-4 py-2 border rounded-full text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MOBILE FILTERS OVERLAY */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden flex justify-end">
          <div className="w-[300px] bg-white dark:bg-gray-900 h-full p-6 overflow-y-auto space-y-6 animate-slide-in">
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-3">
              <h4 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                <FaSlidersH className="text-xs text-amber-500" />
                Filters
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
                  title="Close Filters"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            {renderFilterSidebar(true)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
