const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
  toggleWishlist
} = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/recommendations', getRecommendations);

// Wishlist
router.post('/:id/wishlist', verifyToken, toggleWishlist);

// Admin operations
router.post('/', verifyToken, isAdmin, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
