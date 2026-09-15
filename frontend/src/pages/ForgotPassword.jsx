import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/auth/forgot-password', { email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-luxury space-y-6 animate-fade-in text-xs font-semibold">
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white font-bold">Forgot Password</h1>
          <p className="text-gray-400">Request password reset code.</p>
        </div>

        {error && <p className="text-red-500 font-semibold text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <span className="text-gray-400">Email Address</span>
            <input
              type="email"
              required
              placeholder="customer@Ergosoul.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-55 dark:bg-gray-855 dark:border-gray-700 outline-none text-gray-900 dark:text-white focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg uppercase tracking-wider dark:bg-amber-500 dark:text-gray-900"
          >
            {loading ? 'Processing...' : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
