import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaCreditCard, FaQrcode, FaTruck, FaFileInvoiceDollar, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { clearCart } from '../redux/slices/cartSlice';
import API from '../services/api';
import confetti from 'canvas-confetti';
import { useCurrency } from '../hooks/useCurrency';

export const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const { items, coupon, shippingCharges, tax, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = coupon ? (coupon.discountType === 'percentage' ? (subtotal * coupon.discountAmount) / 100 : coupon.discountAmount) : 0;

  // Address form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Payment mock inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Success view
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (items.length === 0 && !createdOrder) {
      navigate('/shop');
      return;
    }

    // Prepopulate user address if exists
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setStreet(defaultAddr.street);
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setZipCode(defaultAddr.zipCode);
      setCountry(defaultAddr.country);
      setPhoneNumber(defaultAddr.phoneNumber);
    }
  }, [user, items, navigate, createdOrder]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode || !phoneNumber) {
      setCheckoutError('Please complete your shipping address details.');
      return;
    }

    setLoading(true);
    setCheckoutError('');

    try {
      const orderItems = items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        color: item.color
      }));

      const addressData = {
        street,
        city,
        state,
        zipCode,
        country,
        phoneNumber
      };

      // Call API
      const response = await API.post('/orders', {
        items: orderItems,
        shippingAddress: addressData,
        paymentMethod,
        couponCode: coupon?.code || undefined
      });

      // Clear Cart, Trigger celebration
      setCreatedOrder(response.data.order);
      dispatch(clearCart());
      triggerConfetti();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed. Please verify item stocks.');
    } finally {
      setLoading(false);
    }
  };

  // Select preloaded address
  const handleSelectAddress = (addr) => {
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    setPhoneNumber(addr.phoneNumber);
  };

  // If purchase completed, render success invoice view
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto animate-bounce" />
          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold">Comfort is on the Way!</h1>
          <p className="text-xs text-gray-400">Order ID: <span className="font-semibold text-gray-700 dark:text-gray-200 uppercase">{createdOrder._id}</span></p>
        </div>

        {/* Invoice Brief */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-luxury space-y-6">
          <div className="flex justify-between items-center border-b dark:border-gray-800 pb-4">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <FaFileInvoiceDollar className="text-amber-500" />
              Invoice Receipt
            </h3>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">{createdOrder.paymentInfo.method} • PAID</span>
          </div>

          {/* Delivery Address */}
          <div className="text-xs text-gray-600 dark:text-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">Shipping Address</h5>
              <p>{createdOrder.shippingAddress.street}</p>
              <p>{createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} {createdOrder.shippingAddress.zipCode}</p>
              <p>{createdOrder.shippingAddress.country}</p>
              <p className="mt-1 font-semibold text-gray-500">Phone: {createdOrder.shippingAddress.phoneNumber}</p>
            </div>
            <div>
              <h5 className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Details</h5>
              <p>Method: {createdOrder.paymentInfo.method}</p>
              <p>Transaction ID: <span className="font-mono text-[10px]">{createdOrder.paymentInfo.id}</span></p>
              <p>Status: Completed</p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="border-t dark:border-gray-800 pt-4 space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-gray-400">
              <span>Shipping Charges</span>
              <span>{createdOrder.shippingCharges === 0 ? 'Free' : formatPrice(createdOrder.shippingCharges)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>GST Tax (18%)</span>
              <span>{formatPrice(createdOrder.tax)}</span>
            </div>
            {createdOrder.couponDiscount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Coupon Deductions</span>
                <span>-{formatPrice(createdOrder.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-900 dark:text-white font-bold border-t dark:border-gray-800 pt-3">
              <span>Amount Paid</span>
              <span className="text-amber-500">{formatPrice(createdOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/profile"
            className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold tracking-wider uppercase text-center shadow-premium dark:bg-amber-500 dark:text-gray-900"
          >
            Track My Order
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-full text-xs font-bold tracking-wider uppercase text-center border dark:border-gray-700"
          >
            Back to Showroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-8 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white font-bold border-b dark:border-gray-800 pb-4">
        Billing & Delivery
      </h1>

      {checkoutError && <p className="text-xs text-red-500 font-semibold">{checkoutError}</p>}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preset Addresses choice if exists */}
          {user?.addresses?.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-500">Saved Addresses</h4>
              <div className="flex flex-wrap gap-2">
                {user.addresses.map((addr) => (
                  <button
                    key={addr._id}
                    type="button"
                    onClick={() => handleSelectAddress(addr)}
                    className="text-left text-xs p-3 bg-white dark:bg-gray-850 border dark:border-gray-800 rounded-xl hover:border-amber-500 transition-all font-medium"
                  >
                    <p className="font-bold truncate max-w-[150px]">{addr.street}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{addr.city}, {addr.state}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Form */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2.5">
              Shipping Coordinates
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1 sm:col-span-2">
                <span className="text-gray-400 block">Street Address</span>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block">City</span>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block">State / Province</span>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block">ZIP / Postal Code</span>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block">Country</span>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-gray-400 block">Direct Phone Number</span>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white border-b dark:border-gray-850 pb-2.5">
              Secure Payments
            </h3>

            {/* Methods Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { id: 'Stripe', label: 'Stripe Card', icon: <FaCreditCard /> },
                { id: 'Razorpay', label: 'Razorpay SDK', icon: <FaCreditCard /> },
                { id: 'UPI', label: 'UPI Scan QR', icon: <FaQrcode /> },
                { id: 'COD', label: 'Cash (COD)', icon: <FaTruck /> }
              ].map((m) => {
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold transition-all ${
                      active
                        ? 'bg-amber-500 border-amber-400 text-gray-900'
                        : 'bg-white hover:bg-gray-50 border-gray-200 dark:bg-gray-850 dark:border-gray-700 text-gray-500 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Simulated stripe credit card inputs */}
            {paymentMethod === 'Stripe' && (
              <div className="bg-gray-50 dark:bg-gray-950 p-4 border dark:border-gray-800 rounded-xl space-y-3.5 text-xs font-semibold animate-fade-in">
                <div className="space-y-1">
                  <span className="text-gray-400">Card Number</span>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-850 outline-none text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-gray-400">Expiry Date</span>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-850 outline-none text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">Card CVC</span>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-850 outline-none text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI QR Code Generation */}
            {paymentMethod === 'UPI' && (
              <div className="bg-gray-50 dark:bg-gray-950 p-5 border dark:border-gray-800 rounded-xl text-center space-y-4 animate-fade-in">
                <p className="text-xs text-gray-500 font-semibold">Scan with GPay, PhonePe, or Paytm</p>
                <div className="w-32 h-32 bg-white border p-2 mx-auto rounded-lg flex items-center justify-center">
                  {/* Mock QR image */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=Ergosoul@ybl%26am=1%26cu=USD"
                    alt="UPI QR Code"
                    className="w-full h-full"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Scan QR and click 'Place Order' below after paying.</p>
              </div>
            )}

            {/* COD Details */}
            {paymentMethod === 'COD' && (
              <div className="bg-gray-50 dark:bg-gray-950 p-4 border dark:border-gray-800 rounded-xl text-xs text-gray-500 font-medium animate-fade-in leading-relaxed">
                📢 Cash on Delivery is active. You will pay the carrier agent at the time of delivery. Ensure correct phone number to receive shipping coordination SMS calls.
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-premium space-y-5">
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base border-b dark:border-gray-850 pb-2">
              Cart Review
            </h4>

            {/* Items strip list */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={`${item.product._id}-${item.color}`} className="flex justify-between items-center text-xs font-semibold gap-3">
                  <div className="truncate">
                    <p className="text-gray-900 dark:text-white truncate font-serif font-bold">{item.product.name}</p>
                    <span className="text-[10px] text-gray-400">Qty: {item.quantity} • {item.color}</span>
                  </div>
                  <span className="text-amber-500 shrink-0 font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 dark:border-gray-850" />

            {/* Total Math breakdown */}
            <div className="space-y-2 text-xs text-gray-400 font-semibold">
              <div className="flex justify-between">
                <span>Dues Subtotal</span>
                <span className="text-gray-800 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-green-500">
                  <span>Coupon ({coupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping fee</span>
                <span>{shippingCharges === 0 ? 'Free' : formatPrice(shippingCharges)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (18% GST)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-900 dark:text-white font-bold border-t dark:border-gray-850 pt-3">
                <span>Total Amount</span>
                <span className="text-amber-500">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-secondary hover:bg-secondary-dark disabled:bg-gray-150 disabled:text-gray-400 text-gray-900 font-bold rounded-xl text-xs tracking-widest uppercase shadow-premium flex items-center justify-center gap-1.5 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Place Order & Ship'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
