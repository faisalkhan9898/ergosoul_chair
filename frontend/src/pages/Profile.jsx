import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaHeart, FaClipboardList, FaTrashAlt, FaChevronDown, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import API from '../services/api';
import { fetchUserProfile, toggleWishlist } from '../redux/slices/authSlice';
import ProductCard from '../components/ProductCard';

export const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address inputs
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressError, setAddressError] = useState('');

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  // Fetch orders when orders tab becomes active
  useEffect(() => {
    if (activeTab === 'orders' && token) {
      const fetchMyOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await API.get('/orders/my-orders');
          setOrders(res.data.orders);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchMyOrders();
    }
    
    if (activeTab === 'wishlist' && token && user?.wishlist?.length > 0) {
      const fetchWishlistProducts = async () => {
        try {
          const res = await API.get('/products');
          const all = res.data.products;
          const filtered = all.filter(p => user.wishlist.includes(p._id));
          setWishlistItems(filtered);
        } catch (err) {
          console.error(err);
        }
      };
      fetchWishlistProducts();
    }
  }, [activeTab, token, user?.wishlist]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    try {
      await API.put('/auth/profile', { name });
      setProfileSuccess('Profile updated successfully!');
      dispatch(fetchUserProfile());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    if (!street || !city || !state || !zipCode || !phoneNumber) {
      setAddressError('Complete all address fields.');
      return;
    }

    try {
      await API.post('/auth/addresses', {
        street,
        city,
        state,
        zipCode,
        country,
        phoneNumber
      });
      
      // Reset form, reload profile
      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setPhoneNumber('');
      dispatch(fetchUserProfile());
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await API.delete(`/auth/addresses/${id}`);
      dispatch(fetchUserProfile());
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWishlist = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  const getOrderStatusColor = (status) => {
    if (status === 'Delivered') return 'bg-green-500 text-white';
    if (status === 'Shipped') return 'bg-blue-500 text-white';
    if (status === 'Processing') return 'bg-amber-500 text-gray-900';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Tabs List */}
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 h-fit shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-serif text-lg font-bold">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name}</h3>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 lg:gap-1 text-xs font-semibold pb-2 lg:pb-0 scrollbar-none whitespace-nowrap scroll-smooth">
            {[
              { id: 'orders', label: 'Order History', icon: <FaClipboardList /> },
              { id: 'cart', label: `My Cart (${items.length})`, icon: <FaShoppingCart /> },
              { id: 'wishlist', label: `My Wishlist (${user?.wishlist?.length || 0})`, icon: <FaHeart /> },
              { id: 'addresses', label: 'Shipping Addresses', icon: <FaMapMarkerAlt /> },
              { id: 'profile', label: 'Profile Settings', icon: <FaUser /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 lg:px-4.5 lg:py-3 rounded-xl shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-gray-900 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tab details pane */}
        <div className="lg:col-span-3">
          
          {/* Tab 1: Orders Timeline Tracker */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold mb-4">My Orders</h2>
              
              {loadingOrders ? (
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 border border-dashed dark:border-gray-800 rounded-3xl space-y-4">
                  <span className="text-4xl block">📦</span>
                  <p className="text-xs text-gray-400">No orders placed yet. Head over to our catalog to checkout luxury chairs.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6"
                    >
                      {/* Brief info */}
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b dark:border-gray-850 pb-4 text-xs font-semibold">
                        <div>
                          <p className="text-gray-400">ORDER ID</p>
                          <p className="text-gray-900 dark:text-white uppercase font-mono text-[10px]">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">DATE PLACED</p>
                          <p className="text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">TOTAL AMOUNT</p>
                          <p className="text-amber-500 font-bold">${order.totalAmount}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Items row */}
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <img
                              src={item.product?.images[0]}
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded-lg bg-gray-150 border dark:border-gray-800 shrink-0"
                            />
                            <div className="text-xs">
                              <p className="font-serif font-bold text-gray-900 dark:text-white">{item.product?.name || 'Custom Seating Model'}</p>
                              <span className="text-gray-400">Qty: {item.quantity} • Color: {item.color}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-auto">
                              ${item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking timeline */}
                      {order.trackingHistory?.length > 0 && (
                        <div className="border-t dark:border-gray-850 pt-5 space-y-4">
                          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-gray-400">Delivery Status Timeline</h4>
                          
                          <div className="relative pl-6 space-y-5 border-l-2 border-gray-100 dark:border-gray-800 ml-2">
                            {order.trackingHistory.map((history, hIdx) => (
                              <div key={hIdx} className="relative text-xs">
                                {/* Timeline Bullet dot */}
                                <span className="absolute -left-[31px] top-0.5 bg-white dark:bg-gray-900 text-amber-500 rounded-full">
                                  <FaCheckCircle className="text-[14px]" />
                                </span>
                                <div>
                                  <h5 className="font-bold text-gray-900 dark:text-white">{history.status}</h5>
                                  <p className="text-[11px] text-gray-400 font-light mt-0.5 leading-relaxed">{history.description}</p>
                                  <span className="text-[9px] text-gray-400 font-semibold">{new Date(history.date).toLocaleDateString()} {new Date(history.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold mb-4">My Wishlist</h2>
              {user?.wishlist?.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 border border-dashed dark:border-gray-800 rounded-3xl space-y-4 font-sans text-xs">
                  <span className="text-4xl block">❤️</span>
                  <p className="text-gray-400">No products added to wishlist yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((prod) => (
                    <div key={prod._id} className="relative group">
                      <ProductCard product={prod} />
                      <button
                        onClick={() => handleRemoveWishlist(prod._id)}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full z-20 shadow-md hover:scale-105 active:scale-95 transition-all text-xs"
                        title="Remove Wishlist"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Shipping coordinates management */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in text-xs font-sans">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold">Shipping Coordinates</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-full font-bold uppercase tracking-wider text-[10px] dark:bg-amber-500 dark:text-gray-900"
                >
                  {showAddressForm ? 'Cancel' : 'Add Address'}
                </button>
              </div>

              {/* Add address Form */}
              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl space-y-4 shadow-sm"
                >
                  {addressError && <p className="text-red-500 font-semibold">{addressError}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold">
                    <div className="space-y-1 sm:col-span-2">
                      <span>Street Address</span>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>City</span>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>State</span>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>ZIP Code</span>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>Phone Number</span>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-secondary text-gray-900 font-bold rounded-lg uppercase tracking-wider"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses?.length === 0 ? (
                  <p className="text-gray-400 font-light italic">No shipping coordinates defined yet.</p>
                ) : (
                  user?.addresses?.map((addr) => (
                    <div
                      key={addr._id}
                      className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-5 rounded-2xl shadow-sm relative flex flex-col justify-between min-h-[140px]"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{addr.street}</h4>
                        <p className="text-gray-400 mt-1">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-gray-400">{addr.country}</p>
                        <span className="text-gray-400 font-semibold block mt-1.5">Phone: {addr.phoneNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-t dark:border-gray-850 pt-3 mt-3">
                        {addr.isDefault ? (
                          <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase">
                            Default Billing
                          </span>
                        ) : (
                          <span></span>
                        )}
                        
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete Address"
                        >
                          <FaTrashAlt className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-3xl shadow-sm max-w-lg space-y-6 text-xs font-sans">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold border-b dark:border-gray-850 pb-2.5">
                Profile coordinates
              </h2>

              {profileSuccess && <p className="text-green-500 font-semibold">{profileSuccess}</p>}

              <form onSubmit={handleUpdateProfile} className="space-y-4 font-semibold">
                <div className="space-y-1">
                  <span className="text-gray-400 block">Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block">Email Address (Read-Only)</span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold uppercase tracking-wider dark:bg-amber-500 dark:text-gray-900"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}
          {/* Tab 5: Cart Items */}
          {activeTab === 'cart' && (
            <div className="space-y-6 animate-fade-in text-xs font-semibold">
              <h2 className="text-2xl font-serif text-gray-900 dark:text-white font-bold mb-4">My Shopping Cart</h2>
              
              {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-55 dark:bg-gray-900 border border-dashed dark:border-gray-800 rounded-3xl space-y-4">
                  <span className="text-4xl block">🛒</span>
                  <p className="text-xs text-gray-400">Your shopping cart is currently empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                    {items.map((item) => (
                      <div key={`${item.product._id}-${item.color}`} className="flex items-center gap-4 py-3 border-b dark:border-gray-800 last:border-b-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg bg-gray-55 border dark:border-gray-800" />
                        <div className="flex-grow">
                          <h4 className="font-serif font-bold text-gray-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 font-medium">Color: {item.color} | Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-amber-500">${item.product.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 text-sm font-bold text-gray-900 dark:text-white border-t dark:border-gray-800">
                      <span>Total Price:</span>
                      <span className="text-amber-500 text-base">${totalAmount}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link to="/cart" className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-wider text-center dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900">
                      View Cart Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
