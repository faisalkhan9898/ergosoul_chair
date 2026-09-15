import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaShoppingCart, FaUser, FaSun, FaMoon, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { fetchActiveCurrencies } from '../redux/slices/currencySlice';
import VoiceSearch from './VoiceSearch';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const { darkMode } = useSelector((state) => state.theme);
  const { selectedCurrency } = useSelector((state) => state.currency);

  useEffect(() => {
    dispatch(fetchActiveCurrencies());
  }, [dispatch]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = user?.wishlist?.length || 0;

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleVoiceTranscript = (text) => {
    setSearchVal(text);
    navigate(`/shop?search=${encodeURIComponent(text.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center">
            <div className="h-16 w-48 overflow-hidden flex items-center justify-center relative rounded-xl bg-white border border-gray-150 shadow-sm">
              <img
                src="/logo.png"
                alt="Ergosoul Logo"
                className="h-28 w-auto max-w-none object-contain scale-[1.7]"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-gray-700 dark:text-gray-200">
            <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-secondary transition-colors">Catalog</Link>
            <Link to="/blogs" className="hover:text-secondary transition-colors">Blogs</Link>
            <Link to="/compare" className="hover:text-secondary transition-colors">Compare</Link>
          </div>

          {/* Search Inputs (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 max-w-sm w-full mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Find any chair..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm outline-none bg-gray-50 focus:bg-white focus:border-secondary focus:ring-1 focus:ring-secondary dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-950 transition-all"
              />
              <FaSearch className="absolute left-4 top-3 text-gray-400 text-sm" />
            </div>
            <VoiceSearch onTranscript={handleVoiceTranscript} />
          </form>

          {/* Icon Controls */}
          <div className="hidden sm:flex items-center gap-5">

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/profile"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors relative"
              title="Wishlist"
            >
              <FaHeart className="text-lg" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors relative"
              title="Cart"
            >
              <FaShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-gray-900 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown Trigger */}
            <div className="relative group py-2">
              <button
                className="flex items-center gap-1.5 p-2 text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors"
                title="Account Menu"
              >
                <FaUser className="text-lg" />
                {user && <span className="text-xs font-semibold max-w-[70px] truncate">{user.name.split(' ')[0]}</span>}
              </button>
              
              {/* Dropdown Options */}
              <div className="absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-luxury py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-1">
                {user ? (
                  <>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-amber-500 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Sign In
                    </Link>
                    <Link to="/signup" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors"
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-6 space-y-4 shadow-inner">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search chairs..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-full text-sm outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button type="submit" className="p-2 bg-primary dark:bg-amber-500 rounded-full text-white dark:text-gray-900">
              <FaSearch className="text-sm" />
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-3 font-semibold text-sm">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary">Home</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary">Catalog</Link>
            <Link to="/blogs" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary">Blogs</Link>
            <Link to="/compare" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary">Compare</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary flex justify-between">
              <span>Shopping Cart</span>
              <span className="bg-secondary text-gray-900 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
            </Link>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary flex justify-between">
              <span>Wishlist</span>
              {wishlistCount > 0 ? (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{wishlistCount}</span>
              ) : (
                <span className="text-gray-400 text-xs">0</span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 hover:text-secondary">
                  My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="py-2 border-b dark:border-gray-800 text-amber-500">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600 font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4 pt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 bg-secondary text-gray-900 rounded-full font-bold">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
