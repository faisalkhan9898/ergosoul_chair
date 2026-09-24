const Category = require('../models/category.model');
const { uploadToCloudinaryOrLocal } = require('../middleware/upload.middleware');

// @desc    Get active categories (Public)
// @route   GET /api/categories
// @access  Public
const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories (Admin)
// @route   GET /api/categories/admin
// @access  Admin
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
  try {
    let { name, icon, image, subcategories, displayOrder, isActive } = req.body;

    if (req.file) {
      image = await uploadToCloudinaryOrLocal(req.file);
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    // Check for duplicate name
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A department with this name already exists' });
    }

    // Parse subcategories — accept array or comma-separated string
    let parsedSubs = [];
    if (Array.isArray(subcategories)) {
      parsedSubs = subcategories.map(s => s.trim()).filter(Boolean);
    } else if (typeof subcategories === 'string') {
      parsedSubs = subcategories.split(',').map(s => s.trim()).filter(Boolean);
    }

    const category = await Category.create({
      name: name.trim(),
      icon: icon || '📦',
      image: image || '',
      subcategories: parsedSubs,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Department name must be unique' });
    }
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let { name, icon, image, subcategories, displayOrder, isActive } = req.body;

    if (req.file) {
      image = await uploadToCloudinaryOrLocal(req.file);
    }

    if (name !== undefined) category.name = name.trim();
    if (icon !== undefined) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = (isActive === 'true' || isActive === true);

    if (subcategories !== undefined) {
      if (Array.isArray(subcategories)) {
        category.subcategories = subcategories.map(s => s.trim()).filter(Boolean);
      } else if (typeof subcategories === 'string') {
        category.subcategories = subcategories.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Department name must be unique' });
    }
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
