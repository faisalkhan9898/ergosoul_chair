import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaExchangeAlt, FaShoppingCart, FaRegHeart, FaStar, FaWhatsapp, FaCheck } from 'react-icons/fa';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/authSlice';
import { addToCompare, removeFromCompare } from '../redux/slices/compareSlice';
import { useCurrency } from '../hooks/useCurrency';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const compareItems = useSelector((state) => state.compare.items);
  const { formatPrice } = useCurrency();

  const isWishlisted = user?.wishlist?.includes(product._id);
  const isCompared = compareItems.some(item => item._id === product._id);

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    if (isCompared) {
      dispatch(removeFromCompare(product._id));
    } else {
      if (compareItems.length >= 4) {
        alert("You can compare up to 4 chairs at a time.");
        return;
      }
      dispatch(addToCompare(product));
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) {
      const msg = `Hi! I want to enquire about the item: ${product.name} (Price: ${formatPrice(product.price)}), which is currently out of stock. When will it be available?`;
      window.open(`https://wa.me/919326880981?text=${encodeURIComponent(msg)}`, '_blank');
      return;
    }
    dispatch(addToCart({ product, quantity: 1, color: product.specs?.color?.[0] || 'Black' }));
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleSendEnquiry = (e) => {
    e.preventDefault();
    const msg = `Hi! I am interested in enquiring about the ${product.name}. Price: ${formatPrice(product.price)}.${product.stock === 0 ? ' (Currently Out of Stock)' : ''}`;
    window.open(`https://wa.me/919326880981?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Stock status text
  const renderStockBadge = () => {
    if (product.stock === 0) {
      return (
        <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10 shadow-sm">
          Out Of Stock
        </span>
      );
    } else if (product.stock <= 3) {
      return (
        <span className="absolute top-4 left-4 bg-amber-500 text-gray-900 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md z-10 shadow-sm">
          Only {product.stock} Left
        </span>
      );
    } else if (product.isNewArrival) {
      return (
        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md z-10 shadow-sm">
          New
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-premium hover:shadow-luxury transition-all duration-500 flex flex-col font-sans group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      {renderStockBadge()}
      {discountPercent > 0 && (
        <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          -{discountPercent}%
        </span>
      )}

      {/* Image Section */}
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden aspect-[4/3] bg-gray-50 dark:bg-gray-950 p-4">
        <img
          src={product.images && product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Mobile Quick Action Buttons (Always visible on mobile/tablet) */}
        <div className="absolute top-12 right-4 flex flex-col gap-2 z-20 md:hidden">
          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border dark:border-gray-700'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isWishlisted ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
          </button>

          {/* Compare */}
          <button
            onClick={handleCompareToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
              isCompared
                ? 'bg-amber-500 text-gray-950'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border dark:border-gray-700'
            }`}
            title="Toggle Compare"
          >
            <FaExchangeAlt className="text-xs" />
          </button>
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hidden md:flex">
          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-glow'
                : 'bg-white hover:bg-red-500 hover:text-white text-gray-800 shadow-premium'
            }`}
            title="Toggle Wishlist"
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Compare */}
          <button
            onClick={handleCompareToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 delay-75 ${
              isCompared
                ? 'bg-amber-500 text-gray-950 shadow-glow'
                : 'bg-white hover:bg-secondary text-gray-800 hover:text-gray-900 shadow-premium'
            }`}
            title="Toggle Compare"
          >
            <FaExchangeAlt />
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Purpose */}
          <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-1">
            {product.category} • {product.purpose}
          </div>

          {/* Name */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-serif font-bold text-gray-900 dark:text-white hover:text-secondary dark:hover:text-secondary line-clamp-1 mb-2 transition-colors"
          >
            {product.name}
          </Link>

          {/* Stars & Material */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(product.ratings?.average || 5) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-medium">({product.ratings?.count || 1})</span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded ml-auto">
              {product.specs?.material}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-base font-bold text-primary dark:text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          {/* Actions: Add to Cart & Send Enquiry */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border dark:border-gray-700 ${
                addedAnimation
                  ? 'bg-green-500 text-white border-green-500'
                  : product.stock === 0
                  ? 'bg-gray-100 dark:bg-gray-800 hover:bg-amber-500 hover:text-gray-900 text-gray-700 dark:text-gray-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
              }`}
              title={product.stock === 0 ? 'Out of stock - Clicking sends enquiry' : 'Add to Cart'}
            >
              {addedAnimation ? <FaCheck /> : <FaShoppingCart />}
              {addedAnimation ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              onClick={handleSendEnquiry}
              className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              title="Send enquiry via WhatsApp"
            >
              <FaWhatsapp className="text-sm" />
              Send Enquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
