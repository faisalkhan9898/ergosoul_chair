import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden p-4 space-y-4 shadow-sm animate-pulse font-sans">
      {/* Image container */}
      <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      
      {/* Category metadata */}
      <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
      
      {/* Product Title */}
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
      
      {/* Material specs */}
      <div className="flex gap-2">
        <div className="h-3.5 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="h-3.5 w-1/5 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
      
      {/* Price and Buttons */}
      <div className="pt-2 flex justify-between items-center gap-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div className="flex-1 flex gap-2">
          <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
