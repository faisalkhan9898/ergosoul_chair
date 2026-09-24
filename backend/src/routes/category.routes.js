const router = require('express').Router();
const {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Public route to get active categories
router.get('/', getActiveCategories);

// Admin routes
router.get('/admin', verifyToken, isAdmin, getAllCategories);
router.post('/', verifyToken, isAdmin, upload.single('image'), createCategory);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

module.exports = router;
