import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import { verifyOtp, clearError } from '../redux/slices/authSlice';

export const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otpCode, setOtpCode] = useState('');

  const { loading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/profile');
    }
    dispatch(clearError());
  }, [token, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otpCode }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-luxury space-y-6 animate-fade-in text-xs font-semibold">
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">Verify Account</h1>
          <p className="text-gray-400">Complete verification to unlock orders checkout.</p>
        </div>

        {/* Console OTP reminder */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl leading-relaxed text-amber-500 font-medium">
          📢 <span className="font-bold">Developer Notice</span>: Check your Node.js running backend terminal logs to read the simulated 6-digit verification code.
        </div>

        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-gray-400">Email Address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-gray-400">Verification Code</span>
            <div className="relative">
              <input
                type="text"
                required
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500 uppercase tracking-widest font-mono text-center text-sm font-bold"
              />
              <FaKey className="absolute left-4 top-3.5 text-gray-400 text-xs" />
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
              'Verify Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
