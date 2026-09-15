import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('Ergosoul_token') || null,
  loading: false,
  error: null,
  needsVerification: false,
  emailForVerification: ''
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/verify-otp', otpData);
      const { token, user } = response.data;
      localStorage.setItem('Ergosoul_token', token);
      return { token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('Ergosoul_token', token);
      return { token, user };
    } catch (err) {
      // Check if registration OTP verification is pending
      if (err.response?.data?.needsVerification) {
        return rejectWithValue({
          needsVerification: true,
          email: err.response.data.email,
          message: err.response.data.message
        });
      }
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (googleData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/google', googleData);
      const { token, user } = response.data;
      localStorage.setItem('Ergosoul_token', token);
      return { token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Google login failed');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/profile');
      return response.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'auth/toggleWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await API.post(`/products/${productId}/wishlist`);
      return response.data.wishlist;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('Ergosoul_token');
      state.user = null;
      state.token = null;
      state.needsVerification = false;
      state.emailForVerification = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    setVerificationRequired: (state, action) => {
      state.needsVerification = true;
      state.emailForVerification = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.needsVerification = true;
        state.emailForVerification = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.needsVerification = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.needsVerification) {
          state.needsVerification = true;
          state.emailForVerification = action.payload.email;
          state.error = action.payload.message;
        } else {
          state.error = action.payload;
        }
      })

      // Google Login
      .addCase(googleLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('Ergosoul_token');
      })

      // Toggle Wishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = action.payload;
        }
      });
  }
});

export const { logout, clearError, setVerificationRequired } = authSlice.actions;
export default authSlice.reducer;
