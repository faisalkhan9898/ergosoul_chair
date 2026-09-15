import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaShoppingCart, FaExchangeAlt, FaArrowLeft } from 'react-icons/fa';
import { removeFromCompare, clearCompare } from '../redux/slices/compareSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { useCurrency } from '../hooks/useCurrency';

export const Compare = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const compareItems = useSelector((state) => state.compare.items);
  const { formatPrice } = useCurrency();

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1, color: product.specs?.color[0] || 'Black' }));
    alert(`${product.name} added to cart!`);
  };

  if (compareItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <span className="text-6xl block">⚖️</span>
        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Seating Comparison is Empty</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          You haven't selected any chairs to compare. Head over to our catalog and select up to 4 chairs to compare specifications side-by-side.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-premium dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
        >
          Go to Catalog
        </Link>
      </div>
    );
  }

  // Row definition categories for compare
  const comparisonRows = [
    { label: 'Category', valueKey: 'category' },
    { label: 'Usage Purpose', valueKey: 'purpose' },
    { label: 'Price Tag', render: (p) => <span className="font-bold text-amber-600 dark:text-amber-400">{formatPrice(p.price)}</span> },
    { label: 'Frame Material', render: (p) => p.specs?.material || 'N/A' },
    { label: 'Colors Options', render: (p) => p.specs?.color?.join(', ') || 'N/A' },
    { label: 'Chairs Height', render: (p) => p.specs?.height || 'N/A' },
    { label: 'Chair Width', render: (p) => p.specs?.width || 'N/A' },
    { label: 'Chair Weight', render: (p) => p.specs?.weight || 'N/A' },
    { label: 'Load Capacity', render: (p) => p.specs?.weightCapacity || 'N/A' },
    { label: 'Arm Rest Adjustable', render: (p) => p.specs?.armRest || 'None' },
    { label: 'Head Rest Support', render: (p) => p.specs?.headRest || 'None' },
    { label: 'Reclining Angles', render: (p) => p.specs?.reclining || 'No' },
    { label: 'Wheel Casters', render: (p) => p.specs?.wheelType || 'None' },
    { label: 'Warranty Cover', render: (p) => p.warranty || '3 Years' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-500 transition-colors mb-2"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-3">
            <FaExchangeAlt className="text-amber-500 text-2xl" />
            Specs Comparison
          </h1>
        </div>

        <button
          onClick={() => dispatch(clearCompare())}
          className="px-6 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-full text-xs font-semibold transition-colors"
        >
          Remove All Items
        </button>
      </div>

      {/* Grid Comparison Table */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-luxury overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px] text-xs">
          <thead>
            <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <th className="p-5 font-bold text-gray-400 w-48 uppercase tracking-wider">Features Grid</th>
              {compareItems.map((item) => (
                <th key={item._id} className="p-5 text-center min-w-[180px] align-top relative group">
                  <button
                    onClick={() => dispatch(removeFromCompare(item._id))}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-850 border dark:border-gray-800 rounded-full shadow-sm"
                    title="Remove item"
                  >
                    <FaTrashAlt className="text-[10px]" />
                  </button>

                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-24 h-24 object-cover mx-auto rounded-lg bg-gray-100 mb-3 shadow-sm"
                  />

                  <Link
                    to={`/product/${item.slug}`}
                    className="font-serif font-bold text-sm text-gray-900 dark:text-white hover:text-amber-500 line-clamp-2 leading-relaxed"
                  >
                    {item.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
              >
                <td className="p-4 font-bold text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-850/10">
                  {row.label}
                </td>
                {compareItems.map((item) => (
                  <td key={item._id} className="p-4 text-center text-gray-700 dark:text-gray-200">
                    {row.render ? row.render(item) : item[row.valueKey] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Purchase action row */}
            <tr>
              <td className="p-5"></td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-5 text-center">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs tracking-wider uppercase shadow-premium flex items-center justify-center gap-1.5 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
                  >
                    <FaShoppingCart className="text-[10px]" />
                    Add Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
