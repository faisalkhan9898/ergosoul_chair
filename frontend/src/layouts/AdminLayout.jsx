import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaChartBar, FaBoxes, FaClipboardList, FaTicketAlt, FaHome, FaSignOutAlt, FaUserShield, FaBook, FaBars, FaTimes, FaGlobe, FaPercentage, FaLayerGroup, FaFileAlt } from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';
import { initializeTheme, toggleTheme } from '../redux/slices/themeSlice';
import { fetchActiveCurrencies } from '../redux/slices/currencySlice';
import { FaSun, FaMoon } from 'react-icons/fa';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(initializeTheme());
    dispatch(fetchActiveCurrencies());
    
    // Auth Guard check: Redirect if not admin
    if (!loading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, loading, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaChartBar /> },
    { name: 'Item Master Creation', path: '/admin/products', icon: <FaBoxes /> },
    { name: 'Orders Tracker', path: '/admin/orders', icon: <FaClipboardList /> },
    { name: 'Coupons Manager', path: '/admin/coupons', icon: <FaTicketAlt /> },
    { name: 'Manage Blogs', path: '/admin/blogs', icon: <FaBook /> },
    { name: 'Currency Master', path: '/admin/currencies', icon: <FaGlobe /> },
    { name: 'Tax Master', path: '/admin/taxes', icon: <FaPercentage /> },
    { name: 'Category Master', path: '/admin/categories', icon: <FaLayerGroup /> },
    { name: 'Report Master', path: '/admin/reports', icon: <FaFileAlt /> }
  ];

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar navigation - Fixed height with dedicated scrolling */}
      <aside className={`w-64 bg-primary dark:bg-gray-900 text-white flex flex-col justify-between shrink-0 border-r border-gray-800 dark:border-gray-800 fixed inset-y-0 left-0 z-50 md:relative md:h-full transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        {/* Top brand & nav container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Brand Logo */}
          <div className="p-6 border-b border-gray-800 dark:border-gray-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <FaUserShield className="text-secondary text-2xl" />
              <span className="font-serif font-bold text-lg tracking-wider">
                Ergo<span className="text-amber-500">soul</span> Admin
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
              title="Close Menu"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* User profile brief */}
          <div className="px-6 py-4 border-b border-gray-800 dark:border-gray-800 bg-primary-dark/30 shrink-0">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded">
              Administrator
            </span>
          </div>

          {/* Menus list */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-amber-500 text-gray-900 font-bold shadow-sm'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls - Always pinned at bottom */}
        <div className="p-4 border-t border-gray-800 dark:border-gray-800 space-y-2 shrink-0 bg-primary dark:bg-gray-900 z-10">
          {/* Theme switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="flex w-full items-center gap-3.5 px-4.5 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {darkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-gray-400" />}
            Toggle Theme
          </button>
          
          <Link
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3.5 px-4.5 py-2.5 rounded-lg text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
          >
            <FaHome className="text-sm" />
            Back to Showroom
          </Link>
          
          <button
            onClick={() => {
              handleLogout();
              setIsSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3.5 px-4.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
          >
            <FaSignOutAlt />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Panel Content with Dedicated Scrollbar */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header navbar - Fixed */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between px-6 md:px-8 shrink-0 transition-colors duration-300 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-amber-500 rounded-lg transition-colors"
              title="Open Menu"
            >
              <FaBars className="text-lg" />
            </button>
            <h2 className="text-base font-serif font-semibold text-gray-800 dark:text-white">Management Console</h2>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold rounded-lg border border-amber-500/20 transition-colors"
            >
              <FaHome />
              View Showroom
            </Link>
            <div className="flex items-center gap-2">
              <span>Live</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Render pages - Independently Scrollable */}
        <main className="p-4 md:p-8 flex-grow overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
