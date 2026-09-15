import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaExchangeAlt, FaShoppingCart, FaStar, FaVideo, FaSync, FaShieldAlt, FaCheck, FaWhatsapp } from 'react-icons/fa';
import API from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/authSlice';
import ProductCard from '../components/ProductCard';
import { useCurrency } from '../hooks/useCurrency';

export const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotationIdx, setRotationIdx] = useState(0);
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRecommends, setReviewRecommends] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const { user } = useSelector((state) => state.auth);
  const isWishlisted = user?.wishlist?.includes(product?._id);

  // Zoom offsets
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/products/${slug}`);
        const prod = response.data.product;
        setProduct(prod);
        setActiveImageIdx(0);
        setIs360Mode(false);

        // Fetch reviews
        const reviewRes = await API.get(`/reviews/product/${prod._id}`);
        setReviews(reviewRes.data.reviews);

        // Fetch related products
        const recRes = await API.get(`/products/${slug}/recommendations`);
        setRelated(recRes.data.recommendations);

        // Save to recently viewed
        saveRecentlyViewed(prod);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug]);

  const saveRecentlyViewed = (currentProd) => {
    try {
      const stored = localStorage.getItem('Ergosoul_recently_viewed');
      let list = stored ? JSON.parse(stored) : [];
      
      // Filter out duplicates
      list = list.filter(item => item._id !== currentProd._id);
      list.unshift(currentProd); // Add to beginning
      list = list.slice(0, 4); // Limit to 4 items
      
      localStorage.setItem('Ergosoul_recently_viewed', JSON.stringify(list));
      setRecentlyViewed(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.images[activeImageIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%' // Zoom level
    });
  };

  const handleMouseLeaveZoom = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleDrag360 = (e) => {
    if (!product.images || product.images.length === 0) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const width = window.innerWidth;
    const offset = Math.floor((clientX / width) * 10) % 2; // Simulate alternate views
    setRotationIdx(offset === 0 ? 0 : 1);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      const msg = `Hi! I want to enquire about ${product.name} (Price: ${formatPrice(product.price)}), which is currently out of stock. Could you please let me know about availability?`;
      window.open(`https://wa.me/919326880981?text=${encodeURIComponent(msg)}`, '_blank');
      return;
    }
    dispatch(addToCart({
      product,
      quantity,
      color: selectedColor || product.specs?.color?.[0] || 'Standard'
    }));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleSendEnquiry = () => {
    const msg = `Hi! I am interested in enquiring about the ${product.name}. Price: ${formatPrice(product.price)} (Qty: ${quantity}).${product.stock === 0 ? ' (Currently Out of Stock)' : ''}`;
    window.open(`https://wa.me/919326880981?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await API.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        recommends: reviewRecommends
      });

      setReviewSuccess('Review submitted successfully! Thank you.');
      setReviewTitle('');
      setReviewComment('');
      
      // Reload reviews
      const reviewRes = await API.get(`/reviews/product/${product._id}`);
      setReviews(reviewRes.data.reviews);
      
      // Update local rating state
      setProduct(prev => ({
        ...prev,
        ratings: response.data.ratings
      }));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define specs grid items
  const specs = [
    { label: 'Brand', value: product.specs?.brand },
    { label: 'Seat Material', value: product.specs?.material },
    { label: 'Available Colors', value: product.specs?.color?.join(', ') },
    { label: 'Chairs Height', value: product.specs?.height || 'N/A' },
    { label: 'Width Dimensions', value: product.specs?.width || 'N/A' },
    { label: 'Weight Capacity', value: product.specs?.weightCapacity || 'N/A' },
    { label: 'Arm Rest Type', value: product.specs?.armRest || 'None' },
    { label: 'Head Rest Configuration', value: product.specs?.headRest || 'None' },
    { label: 'Reclining Angles', value: product.specs?.reclining || 'No' },
    { label: 'Wheel Casters Type', value: product.specs?.wheelType || 'None' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-20">
      
      {/* 1. PRODUCT METADATA & DISPLAY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Images & Interactive toggles */}
        <div className="space-y-4">
          <div
            className="border border-gray-100 dark:border-gray-800 rounded-3xl relative overflow-hidden bg-gray-50 dark:bg-gray-950 aspect-[4/3] cursor-zoom-in"
            onMouseMove={handleImageZoom}
            onMouseLeave={handleMouseLeaveZoom}
            onTouchMove={handleDrag360}
          >
            {/* Dynamic View rendering */}
            {!is360Mode ? (
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center select-none bg-gray-900 p-6">
                <img
                  src={product.images[rotationIdx]}
                  alt="360 rotation"
                  className="w-full h-full object-contain pointer-events-none"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase flex items-center gap-1.5 font-bold">
                  <FaSync className="animate-spin text-xs" /> Drag Left/Right
                </div>
              </div>
            )}

            {/* Magnifier zoom portal */}
            <div
              className="absolute inset-0 pointer-events-none border-2 border-amber-500 rounded-3xl shadow-glow hidden md:block"
              style={zoomStyle}
            ></div>
          </div>

          {/* Thumbnail row */}
          <div className="flex gap-3 justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl border dark:border-gray-800">
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIdx(idx);
                    setIs360Mode(false);
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white dark:bg-gray-850 ${
                    activeImageIdx === idx && !is360Mode
                      ? 'border-amber-500 shadow-glow'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* 360 & Video trigger buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIs360Mode(!is360Mode)}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  is360Mode
                    ? 'bg-amber-500 border-amber-400 text-gray-950'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-850 dark:text-gray-200 dark:border-gray-700'
                }`}
              >
                <FaSync className="text-xs" />
                360° View
              </button>
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <FaVideo className="text-red-500" />
                  Video Walkthrough
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Buying details */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">
              {product.category} • {product.purpose}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold leading-tight">
              {product.name}
            </h1>
            
            {/* Stars Row */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500 text-sm">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(product.ratings?.average || 5) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 font-semibold mt-0.5">
                {product.ratings?.average || '5.0'} / 5.0 ({reviews.length} customer reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 border-y dark:border-gray-800 py-4">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
            {product.stock === 0 ? (
              <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2.5 py-1 rounded ml-auto">
                Out of Stock (Enquiry Available)
              </span>
            ) : (
              <span className="text-[10px] bg-green-500/10 text-green-500 font-bold px-2.5 py-1 rounded ml-auto">
                In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 text-xs">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-amber-500 text-lg" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Warranty</h5>
                <p className="text-gray-400 text-[10px]">{product.warranty || '3 Years'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaSync className="text-amber-500 text-lg" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">Return Policy</h5>
                <p className="text-gray-400 text-[10px]">30 Days Comfort Guarantee</p>
              </div>
            </div>
          </div>

          {/* Quantity and Cart Triggers */}
          <div className="space-y-4">
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-gray-900 dark:text-white min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}
                    className="px-3.5 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                {addedToast && (
                  <span className="text-xs text-green-500 font-bold flex items-center gap-1 animate-fade-in">
                    <FaCheck /> Added to shopping cart!
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-premium transition-all ${
                  product.stock === 0
                    ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border dark:border-gray-700'
                    : 'bg-primary hover:bg-primary-dark text-white dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
                title={product.stock === 0 ? 'Out of stock - Clicking sends enquiry automatically' : 'Add to Shopping Cart'}
              >
                <FaShoppingCart />
                {addedToast ? 'Added to Cart!' : 'Add to Shopping Cart'}
              </button>

              <button
                onClick={handleSendEnquiry}
                className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-xl font-bold text-xs tracking-widest uppercase shadow-premium flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                title="Send enquiry via WhatsApp"
              >
                <FaWhatsapp className="text-base" />
                Send Enquiry
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`px-4 border rounded-xl flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 border-red-400 text-white shadow-glow'
                    : 'bg-white hover:bg-gray-55 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                }`}
                title="Toggle Wishlist"
              >
                <FaHeart className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DESCRIPTION AND SPECIFICATIONS TABBED VIEW */}
      <section className="border-t dark:border-gray-800 pt-10">
        <div className="flex border-b dark:border-gray-800 mb-8 overflow-x-auto">
          {[
            { id: 'specs', label: 'Detailed Specifications' },
            { id: 'features', label: 'Comfort Features' },
            { id: 'reviews', label: `Reviews (${reviews.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-serif font-semibold border-b-2 whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Specs Grid */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl font-sans text-sm">
            {specs.map((item, index) => (
              <div
                key={index}
                className="flex justify-between py-3 border-b dark:border-gray-800/50"
              >
                <span className="text-gray-400">{item.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{item.value || 'Custom Spec'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Comfort Features */}
        {activeTab === 'features' && (
          <div className="max-w-3xl space-y-6 text-sm text-gray-400 font-light leading-relaxed">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base">Long Description</h4>
            <p>{product.longDescription || product.description}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                'Gas Lift Cylinder Class-4 Heavy-Duty',
                'Dual-curved responsive lumber contouring',
                'Cold-cured high density foam backing',
                'Anti-scratch smooth PU caster rollers'
              ].map((feat, i) => (
                <li key={i} className="flex gap-2 items-center text-gray-300">
                  <FaCheck className="text-green-500 text-xs shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl space-y-12">
            {/* Reviews display */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 font-light italic">No reviews yet for this product. Be the first to share your comfort experience!</p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border dark:border-gray-800 space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <h5 className="font-serif font-bold text-sm text-gray-900 dark:text-white">
                        {rev.title || 'Seating Comfort Rating'}
                      </h5>
                      <div className="flex text-amber-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < rev.rating ? 'fill-current' : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {rev.comment}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>By {rev.user?.name || 'Verified Customer'}</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a review Form */}
            <div className="border-t dark:border-gray-800 pt-8 space-y-6">
              <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base">Write a Seating Review</h4>
              
              {reviewError && <p className="text-xs text-red-500 font-semibold">{reviewError}</p>}
              {reviewSuccess && <p className="text-xs text-green-500 font-semibold">{reviewSuccess}</p>}

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-sans">
                {/* Rating Input */}
                <div className="space-y-1.5">
                  <span className="text-gray-400 block font-semibold">Comfort Rating (1-5 Stars)</span>
                  <div className="flex gap-1.5 text-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`transition-colors ${
                          star <= reviewRating ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <span className="text-gray-400 block font-semibold">Review Title</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incredibly supportive mesh back"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1">
                  <span className="text-gray-400 block font-semibold">Your Review Comment</span>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe how the chair supports your back, armrests adjustments, wheel gliding, or overall showroom experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-sm dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
                >
                  Submit Comfort Review
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* 3. RELATED PRODUCTS RAIL */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold">Related Seating Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 4. RECENTLY VIEWED RAIL */}
      {recentlyViewed.length > 1 && (
        <section className="space-y-6 border-t dark:border-gray-800 pt-10">
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed
              .filter(item => item._id !== product._id)
              .map(prod => (
                <ProductCard key={prod._id} product={prod} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
