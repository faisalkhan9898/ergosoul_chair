import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEnvelope, FaGoogle } from 'react-icons/fa';
import { loginUser, googleLoginUser, clearError } from '../redux/slices/authSlice';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, error, token, user, needsVerification, emailForVerification } = useSelector((state) => state.auth);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If token exists and user info is loaded, redirect accordingly
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (redirect === 'checkout') {
        navigate('/checkout');
      } else {
        navigate('/profile');
      }
    }

    // Handle OTP verification redirect
    if (needsVerification && emailForVerification) {
      navigate(`/verify-otp?email=${encodeURIComponent(emailForVerification)}`);
    }

    // Clean errors on load
    dispatch(clearError());
  }, [token, user, needsVerification, emailForVerification, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleMockLogin = () => {
    // Simulated Google login profile
    const googleProfile = {
      email: 'google_customer@Ergosoul.com',
      name: 'Google Customer',
      googleId: 'g_123456789_Ergosoul'
    };
    dispatch(googleLoginUser(googleProfile));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-luxury space-y-6 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">Sign In</h1>
          <p className="text-xs text-gray-400">Welcome back to Ergosoul luxury lounge.</p>
        </div>

        {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <span className="text-gray-400">Email Address</span>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@Ergosoul.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-850 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
              />
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-400 text-xs" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-gray-400">Password</span>
              <Link to="/forgot-password" className="text-[10px] text-amber-500 hover:text-amber-600 transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-850 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
              />
              <FaLock className="absolute left-4 top-3.5 text-gray-400 text-xs" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-gray-150 disabled:text-gray-400 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-gray-900 font-bold rounded-lg uppercase tracking-wider transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <span className="absolute inset-x-0 border-t dark:border-gray-800"></span>
          <span className="relative px-3 text-[10px] bg-white dark:bg-gray-900 text-gray-400 uppercase tracking-widest font-semibold">Or</span>
        </div>

        {/* Google Mock */}
        <button
          onClick={handleGoogleMockLogin}
          className="w-full py-3 bg-white hover:bg-gray-55 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-white border dark:border-gray-750 font-bold rounded-lg text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm"
        >
          <FaGoogle className="text-red-500" />
          Continue with Google
        </button>

        {/* Signup redirection */}
        <p className="text-center text-[11px] text-gray-400 font-light">
          New to Ergosoul?{' '}
          <Link to="/signup" className="text-amber-500 font-semibold hover:text-amber-600">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
