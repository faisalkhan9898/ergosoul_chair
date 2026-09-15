const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOtp,
  authUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile (Protected)
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);

// Addresses (Protected)
router.post('/addresses', verifyToken, addAddress);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);

module.exports = router;
