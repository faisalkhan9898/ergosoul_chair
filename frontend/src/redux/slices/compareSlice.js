import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [] // Max 4 products for comparative specifications grid
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const product = action.payload;
      const exists = state.items.some(item => item._id === product._id);
      
      if (!exists && state.items.length < 4) {
        state.items.push(product);
      }
    },
    removeFromCompare: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    }
  }
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
