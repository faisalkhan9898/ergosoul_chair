const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews
} = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, createReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;
