/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F2937', // Charcoal Gray
          dark: '#111827',
          light: '#374151',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Amber Gold
          light: '#FBBF24',
          dark: '#D97706',
        },
        accent: {
          success: '#10B981', // Emerald for active stock/sales
          danger: '#EF4444',
          info: '#3B82F6',
        },
        neutral: {
          bg: '#FFFFFF',
          card: '#F9FAFB',
          text: '#111827',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(31, 41, 55, 0.08)',
        'luxury': '0 20px 40px -15px rgba(31, 41, 55, 0.12)',
        'glow': '0 0 15px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
