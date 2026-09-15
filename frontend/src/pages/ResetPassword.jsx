import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/auth/reset-password', { email, otpCode, newPassword });
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-luxury space-y-6 animate-fade-in text-xs font-semibold">
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">Reset Password</h1>
          <p className="text-gray-400">Complete verification to define a new password.</p>
        </div>

        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
        {success && <p className="text-green-500 font-semibold text-center">{success}</p>}

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
            <span className="text-gray-400">OTP Verification Code</span>
            <input
              type="text"
              required
              maxLength="6"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white text-center font-mono text-sm tracking-widest font-bold focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-gray-400">New Password</span>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-55 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg uppercase tracking-wider dark:bg-amber-500 dark:text-gray-900"
          >
            {loading ? 'Processing...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
