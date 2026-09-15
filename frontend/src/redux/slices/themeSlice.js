import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = window.localStorage.getItem('Ergosoul_dark_mode');
    if (typeof storedPrefs === 'string') {
      return storedPrefs === 'true';
    }
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return true;
    }
  }
  return false;
};

const initialState = {
  darkMode: getInitialTheme()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('Ergosoul_dark_mode', state.darkMode.toString());
      
      // Update HTML node class list
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initializeTheme: (state) => {
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
