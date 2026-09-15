const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createPaymentIntent
} = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.post('/pay-session', verifyToken, createPaymentIntent);

// Specific order detail
router.get('/:id', verifyToken, getOrderById);

// Admin operations
router.get('/admin/all', verifyToken, isAdmin, getOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
