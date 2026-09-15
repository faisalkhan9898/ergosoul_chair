const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
} = require('../controllers/coupon.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/validate', verifyToken, validateCoupon);

// Admin operations
router.get('/', verifyToken, isAdmin, getCoupons);
router.post('/', verifyToken, isAdmin, createCoupon);
router.delete('/:id', verifyToken, isAdmin, deleteCoupon);

module.exports = router;
