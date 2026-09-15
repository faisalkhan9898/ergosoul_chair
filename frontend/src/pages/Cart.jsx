import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaMinus, FaPlus, FaTicketAlt, FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import API from '../services/api';
import { useCurrency } from '../hooks/useCurrency';

const ENABLE_CHECKOUT = true;

export const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const { items, coupon, shippingCharges, tax, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleEnquireCart = () => {
    const itemsList = items.map(item => `- ${item.product.name} (Qty: ${item.quantity}, Color: ${item.color})`).join('%0A');
    const msg = `Hi! I want to enquire about the following items in my cart:%0A${itemsList}%0ATotal Amount: ${formatPrice(totalAmount)}`;
    window.open(`https://wa.me/919326880981?text=${msg}`, '_blank');
  };

  const handleQtyChange = (productId, color, currentQty, operation) => {
    let nextQty = currentQty;
    if (operation === 'plus') nextQty += 1;
    if (operation === 'minus') nextQty -= 1;

    if (nextQty < 1) return;
    dispatch(updateQuantity({ productId, color, quantity: nextQty }));
  };

  const handleCouponApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidating(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const response = await API.post('/coupons/validate', {
        code: couponCode.trim(),
        subtotal
      });

      dispatch(applyCoupon(response.data.coupon));
      setCouponSuccess(response.data.message);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6 font-sans">
        <span className="text-6xl block">🛒</span>
        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Shopping Cart is Empty</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          You haven't added any luxury seating models yet. Discover custom ergonomic solutions in our shop showroom.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-premium dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  // Cost deductions
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountAmount) / 100;
    } else {
      discountAmount = coupon.discountAmount;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold flex items-center gap-3">
        <FaShoppingCart className="text-amber-500 text-2xl" />
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product._id}-${item.color}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl shadow-sm"
            >
              {/* Product brief */}
              <div className="flex gap-4 items-center">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl bg-gray-50 border dark:border-gray-800"
                />
                <div>
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-serif font-bold text-sm text-gray-900 dark:text-white hover:text-amber-500 leading-snug line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    Category: {item.product.category} • Color: {item.color}
                  </p>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mt-1">
                    {formatPrice(item.product.price)}
                  </span>
                </div>
              </div>

              {/* Quantity selectors & trash */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                {/* Quantity */}
                <div className="flex items-center border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-850">
                  <button
                    onClick={() => handleQtyChange(item.product._id, item.color, item.quantity, 'minus')}
                    className="px-3 py-1.5 hover:bg-gray-150 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <FaMinus className="text-[9px]" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.product._id, item.color, item.quantity, 'plus')}
                    className="px-3 py-1.5 hover:bg-gray-150 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <FaPlus className="text-[9px]" />
                  </button>
                </div>

                {/* Subtotal & trash */}
                <div className="flex items-center gap-4 ml-auto sm:ml-0">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  
                  <button
                    onClick={() => dispatch(removeFromCart({ productId: item.product._id, color: item.color }))}
                    className="p-2 text-gray-400 hover:text-red-500 border border-transparent hover:border-gray-150 rounded-lg transition-all"
                    title="Remove item"
                  >
                    <FaTrashAlt className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Order summary details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-premium space-y-6">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base border-b dark:border-gray-800 pb-3">
              Order Summary
            </h4>

            {/* Calculations */}
            <div className="space-y-3.5 text-xs text-gray-400 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-gray-800 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Discount ({coupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-gray-800 dark:text-white">
                  {shippingCharges === 0 ? 'Free' : formatPrice(shippingCharges)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (18% GST)</span>
                <span className="text-gray-800 dark:text-white">{formatPrice(tax)}</span>
              </div>

              <hr className="my-3 border-gray-100 dark:border-gray-850" />

              <div className="flex justify-between text-sm text-gray-900 dark:text-white font-bold">
                <span>Grand Total</span>
                <span className="text-amber-500">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout and Enquiry Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckoutRedirect}
                className="w-full py-3.5 bg-secondary hover:bg-secondary-dark text-gray-900 font-bold rounded-xl text-xs tracking-widest uppercase shadow-premium flex items-center justify-center gap-2 transition-all"
              >
                Proceed to Checkout
                <FaArrowRight className="text-[10px]" />
              </button>
              <button
                onClick={handleEnquireCart}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all border dark:border-gray-700"
              >
                Enquire via WhatsApp
              </button>
            </div>
          </div>

          {/* Promo Coupon Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-premium space-y-4">
            <h5 className="font-serif font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FaTicketAlt className="text-amber-500" />
              Promotional Coupons
            </h5>
            
            {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-500 font-semibold">{couponSuccess}</p>}

            {!coupon ? (
              <form onSubmit={handleCouponApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3.5 py-2 border rounded-lg text-xs outline-none bg-gray-50 focus:bg-white focus:border-amber-500 uppercase font-bold dark:bg-gray-800 dark:border-gray-700"
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold dark:bg-amber-500 dark:text-gray-900"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 px-3.5 py-2.5 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-green-500 block uppercase">{coupon.code}</span>
                  <span className="text-[10px] text-gray-400">Coupon discount active</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
