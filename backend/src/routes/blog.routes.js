const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  deleteBlog
} = require('../controllers/blog.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin operations
router.post('/', verifyToken, isAdmin, createBlog);
router.delete('/:id', verifyToken, isAdmin, deleteBlog);

module.exports = router;
