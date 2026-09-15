import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Client Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminCoupons from './pages/AdminCoupons';
import AdminBlogs from './pages/AdminBlogs';
import AdminCurrencies from './pages/AdminCurrencies';
import AdminTaxes from './pages/AdminTaxes';
import AdminCategories from './pages/AdminCategories';
import AdminReports from './pages/AdminReports';

export const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Client & Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="compare" element={<Compare />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            
            {/* Auth */}
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Management Console Panel Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="currencies" element={<AdminCurrencies />} />
            <Route path="taxes" element={<AdminTaxes />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
