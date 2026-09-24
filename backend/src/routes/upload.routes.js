const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinaryOrLocal } = require('../middleware/upload.middleware');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/upload
// Handles single image upload for departments, categories, blogs, etc.
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const url = await uploadToCloudinaryOrLocal(req.file);
    res.json({
      success: true,
      url,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
