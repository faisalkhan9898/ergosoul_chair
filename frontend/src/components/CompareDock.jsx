import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrashAlt, FaExchangeAlt, FaTimes } from 'react-icons/fa';
import { removeFromCompare, clearCompare } from '../redux/slices/compareSlice';

export const CompareDock = () => {
  const dispatch = useDispatch();
  const compareItems = useSelector((state) => state.compare.items);

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-luxury z-40 p-4 transform translate-y-0 transition-transform duration-500 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FaExchangeAlt />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Compare Seating ({compareItems.length}/4)</h4>
            <p className="text-xs text-gray-400">Review side-by-side dimensions, materials, and support details.</p>
          </div>
        </div>

        {/* Thumbnail Cards Grid */}
        <div className="flex flex-wrap items-center gap-3 justify-center max-h-20 overflow-y-auto md:max-h-none py-1">
          {compareItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1.5 pr-3 rounded-xl border border-gray-100 dark:border-gray-700 relative group"
            >
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-10 h-10 object-cover rounded-lg bg-gray-100"
              />
              <span className="text-xs font-medium max-w-[100px] truncate text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
              <button
                onClick={() => dispatch(removeFromCompare(item._id))}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-1"
                title="Remove"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => dispatch(clearCompare())}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Clear All
          </button>
          
          <Link
            to="/compare"
            className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-semibold shadow-premium flex items-center gap-2 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
          >
            <FaExchangeAlt className="text-xs" />
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareDock;
