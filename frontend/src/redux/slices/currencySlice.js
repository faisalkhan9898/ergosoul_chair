import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Fetch active currencies for showroom
export const fetchActiveCurrencies = createAsyncThunk(
  'currency/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/currencies');
      return response.data.currencies;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch currencies');
    }
  }
);

const getInitialCurrency = () => {
  try {
    const saved = localStorage.getItem('Ergosoul_currency');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore error
  }
  // Fallback default (Rupee)
  return { code: 'INR', symbol: '₹', exchangeRate: 1.0 };
};

const initialState = {
  currencies: [getInitialCurrency()],
  selectedCurrency: getInitialCurrency(),
  loading: false,
  error: null
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
      try {
        localStorage.setItem('Ergosoul_currency', JSON.stringify(action.payload));
        localStorage.setItem('Ergosoul_currency_explicit', 'true');
      } catch (e) {
        // Ignore write error
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = action.payload;
        
        const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        const explicit = !isAdminRoute && localStorage.getItem('Ergosoul_currency_explicit') === 'true';
        const defaultCurr = action.payload.find(c => c.isDefault) || action.payload[0];
        
        if (isAdminRoute && defaultCurr) {
          state.selectedCurrency = defaultCurr;
          try {
            localStorage.setItem('Ergosoul_currency', JSON.stringify(defaultCurr));
          } catch (e) {}
        } else if (explicit) {
          // If user explicitly chose a currency in showroom, try to keep it if it is still active
          const currentSelected = state.selectedCurrency;
          const matched = action.payload.find(c => c.code === currentSelected.code);
          if (matched) {
            state.selectedCurrency = matched;
            try {
              localStorage.setItem('Ergosoul_currency', JSON.stringify(matched));
            } catch (e) {}
          } else if (defaultCurr) {
            state.selectedCurrency = defaultCurr;
            try {
              localStorage.setItem('Ergosoul_currency', JSON.stringify(defaultCurr));
            } catch (e) {}
          }
        } else if (defaultCurr) {
          // Otherwise, always use the system default currency from the database
          state.selectedCurrency = defaultCurr;
          try {
            localStorage.setItem('Ergosoul_currency', JSON.stringify(defaultCurr));
          } catch (e) {}
        }
      })
      .addCase(fetchActiveCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCurrency } = currencySlice.actions;
export default currencySlice.reducer;
