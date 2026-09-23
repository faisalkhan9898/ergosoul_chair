import axios from 'axios';

// Automatically determine base API URL:
// 1. From VITE_API_URL environment variable (.env.development, .env.production, .env.online, or .env.local)
// 2. Production fallback: https://ergosoul.in/api
// 3. Development fallback: http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://ergosoul.in/api' : 'http://localhost:5000/api');

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach authorization token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('Ergosoul_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses for clear error diagnostics
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.warn(
        `[Ergosoul API Connection Warning] Could not reach ${baseURL}.\n` +
        `• When running local backend: ensure 'npm run dev' is running in backend/ on port 5000.\n` +
        `• To test against the online backend instead, run: npm run dev:online`
      );
    }
    return Promise.reject(error);
  }
);

// Helpful startup notification in browser console during development
if (import.meta.env.DEV) {
  const isOnline = baseURL.includes('ergosoul.in');
  console.log(
    `%c[Ergosoul API]%c Connected to ${isOnline ? '🌐 ONLINE' : '💻 LOCAL'} Backend: %c${baseURL}`,
    'background: #012348; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
    'font-weight: bold; color: #334155; margin-left: 4px;',
    'color: #ea580c; font-weight: bold;'
  );
}

// Helper to get backend base origin (e.g. 'https://ergosoul.in' or 'http://localhost:5000')
export const getBackendOrigin = () => {
  return baseURL.replace(/\/api\/?$/, '');
};

// Helper to resolve image URLs properly across both environments
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const origin = getBackendOrigin();
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default API;
