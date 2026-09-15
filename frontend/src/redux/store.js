import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import compareReducer from './slices/compareSlice';
import themeReducer from './slices/themeSlice';
import currencyReducer from './slices/currencySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    compare: compareReducer,
    theme: themeReducer,
    currency: currencyReducer
  }
});

export default store;
