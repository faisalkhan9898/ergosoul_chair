import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompareDock from '../components/CompareDock';
import LiveChat from '../components/LiveChat';
import AiRecommendationBubble from '../components/AiRecommendationBubble';
import { initializeTheme } from '../redux/slices/themeSlice';
import { fetchUserProfile } from '../redux/slices/authSlice';

export const MainLayout = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    // Initialize dark/light mode class settings on body
    dispatch(initializeTheme());

    // Fetch user profile if token exists to keep states synchronized
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-bg dark:bg-gray-950 text-neutral-text dark:text-gray-100 transition-colors duration-300">
      {/* Navigation */}
      <Navbar />

      {/* Main Pages */}
      <main className="flex-grow pb-24 md:pb-16">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Assist Widgets */}
      <CompareDock />
      <AiRecommendationBubble />
      <LiveChat />

      {/* WhatsApp Integration Bubble */}
      <a
        href="https://wa.me/919326880981?text=Hi%20Ergosoul!%20I%20am%20interested%20in%20custom%20furniture%20inquiries."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 sm:bottom-28 z-50 bg-[#25D366] hover:bg-[#20BA56] text-white p-3.5 rounded-full shadow-luxury hover:scale-105 active:scale-95 transition-all"
        title="Chat on WhatsApp"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.493 4.904 1.495 5.229 0 9.485-4.254 9.488-9.486.002-2.535-.985-4.919-2.78-6.718-1.794-1.799-4.175-2.79-6.713-2.792-5.233 0-9.49 4.256-9.493 9.489-.001 1.836.5 3.578 1.447 5.128L2.235 21.8l5.412-1.416zM17.56 14.5c-.3-.15-1.77-.875-2.045-.975s-.475-.15-.675.15-.775.975-.95 1.175-.35.225-.65.075c-.3-.15-1.265-.467-2.41-1.485-.89-.79-1.49-1.77-1.665-2.07-.17-.3-.02-.46.13-.61.135-.13.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.675-1.625-.925-2.225c-.244-.589-.48-.51-.675-.52-.175-.01-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.225 5.11 4.525.714.31 1.272.495 1.706.634.714.227 1.365.195 1.88.118.57-.085 1.77-.725 2.02-1.425s.25-1.3.175-1.425-.3-.225-.6-.375z" />
        </svg>
      </a>
    </div>
  );
};

export default MainLayout;
