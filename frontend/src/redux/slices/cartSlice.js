import { createSlice } from '@reduxjs/toolkit';

// Load cart state from localStorage
const loadCartState = () => {
  try {
    const serializedState = localStorage.getItem('Ergosoul_cart');
    if (serializedState === null) {
      return {
        items: [],
        coupon: null,
        shippingCharges: 0,
        tax: 0,
        totalAmount: 0
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      items: [],
      coupon: null,
      shippingCharges: 0,
      tax: 0,
      totalAmount: 0
    };
  }
};

const saveCartState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('Ergosoul_cart', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const recalculateTotals = (state) => {
  let subtotal = 0;
  state.items.forEach(item => {
    subtotal += item.product.price * item.quantity;
  });

  // Calculate discount
  let discount = 0;
  if (state.coupon) {
    if (state.coupon.discountType === 'percentage') {
      discount = (subtotal * state.coupon.discountAmount) / 100;
    } else {
      discount = state.coupon.discountAmount;
    }
  }

  // flat rates
  state.shippingCharges = subtotal > 1000 || subtotal === 0 ? 0 : 150; // free shipping above 1000
  state.tax = Math.round((subtotal - discount) * 0.18); // 18% GST
  state.totalAmount = Math.max(0, subtotal - discount + state.shippingCharges + state.tax);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartState(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, color } = action.payload;
      const existingItem = state.items.find(
        item => item.product._id === product._id && item.color === color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, color });
      }

      recalculateTotals(state);
      saveCartState(state);
    },
    removeFromCart: (state, action) => {
      const { productId, color } = action.payload;
      state.items = state.items.filter(
        item => !(item.product._id === productId && item.color === color)
      );
      
      recalculateTotals(state);
      saveCartState(state);
    },
    updateQuantity: (state, action) => {
      const { productId, color, quantity } = action.payload;
      const item = state.items.find(
        item => item.product._id === productId && item.color === color
      );
      
      if (item) {
        item.quantity = quantity;
      }

      recalculateTotals(state);
      saveCartState(state);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload; // { code, discountType, discountAmount }
      recalculateTotals(state);
      saveCartState(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      recalculateTotals(state);
      saveCartState(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.shippingCharges = 0;
      state.tax = 0;
      state.totalAmount = 0;
      saveCartState(state);
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
