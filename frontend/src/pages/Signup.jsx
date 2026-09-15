import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { registerUser, clearError } from '../redux/slices/authSlice';

export const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { loading, error, needsVerification, emailForVerification } = useSelector((state) => state.auth);

  useEffect(() => {
    if (needsVerification && emailForVerification) {
      navigate(`/verify-otp?email=${encodeURIComponent(emailForVerification)}`);
    }
    dispatch(clearError());
  }, [needsVerification, emailForVerification, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-luxury space-y-6 animate-fade-in">
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">Create Account</h1>
          <p className="text-xs text-gray-400">Join Ergosoul and configure your dream seating setup.</p>
        </div>

        {(validationError || error) && (
          <p className="text-xs text-red-500 font-semibold text-center">{validationError || error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* Name */}
          <div className="space-y-1">
            <span className="text-gray-400">Full Name</span>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
              />
              <FaUser className="absolute left-4 top-3.5 text-gray-400 text-xs" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <span className="text-gray-400">Email Address</span>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@Ergosoul.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
              />
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-400 text-xs" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <span className="text-gray-400">Password</span>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
              />
              <FaLock className="absolute left-4 top-3.5 text-gray-400 text-xs" />
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-1">
            <span className="text-gray-400">Confirm Password</span>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
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
              'Register & Send OTP'
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 font-light">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 font-semibold hover:text-amber-600">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
