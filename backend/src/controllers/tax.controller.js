const Tax = require('../models/tax.model');

// @desc    Get active taxes (Public)
// @route   GET /api/taxes
// @access  Public
const getActiveTaxes = async (req, res, next) => {
  try {
    const taxes = await Tax.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
    res.json({ success: true, taxes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all taxes (Admin only)
// @route   GET /api/taxes/admin
// @access  Private/Admin
const getAllTaxes = async (req, res, next) => {
  try {
    const taxes = await Tax.find({}).sort({ isDefault: -1, name: 1 });
    res.json({ success: true, taxes });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a tax (Admin only)
// @route   POST /api/taxes
// @access  Private/Admin
const createTax = async (req, res, next) => {
  try {
    const { name, rate, description, isDefault, isActive } = req.body;

    const taxExists = await Tax.findOne({ name });
    if (taxExists) {
      res.status(400);
      throw new Error('Tax name already exists');
    }

    const tax = new Tax({
      name,
      rate: Number(rate),
      description,
      isDefault: isDefault || false,
      isActive: isActive !== undefined ? isActive : true
    });

    await tax.save();
    res.status(201).json({ success: true, tax });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tax (Admin only)
// @route   PUT /api/taxes/:id
// @access  Private/Admin
const updateTax = async (req, res, next) => {
  try {
    const { name, rate, description, isDefault, isActive } = req.body;

    const tax = await Tax.findById(req.params.id);
    if (!tax) {
      res.status(404);
      throw new Error('Tax not found');
    }

    // Prevent removing default flag if this is the only default tax
    if (tax.isDefault && isDefault === false) {
      const otherDefaults = await Tax.countDocuments({ _id: { $ne: req.params.id }, isDefault: true });
      if (otherDefaults === 0) {
        res.status(400);
        throw new Error('Must have at least one default tax');
      }
    }

    // Prevent deactivating the default tax
    if ((isDefault === true || (isDefault === undefined && tax.isDefault)) && isActive === false) {
      res.status(400);
      throw new Error('Default tax must be active');
    }

    tax.name = name || tax.name;
    tax.rate = rate !== undefined ? Number(rate) : tax.rate;
    tax.description = description !== undefined ? description : tax.description;
    tax.isDefault = isDefault !== undefined ? isDefault : tax.isDefault;
    tax.isActive = isActive !== undefined ? isActive : tax.isActive;

    await tax.save();
    res.json({ success: true, tax });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tax (Admin only)
// @route   DELETE /api/taxes/:id
// @access  Private/Admin
const deleteTax = async (req, res, next) => {
  try {
    const tax = await Tax.findById(req.params.id);
    if (!tax) {
      res.status(404);
      throw new Error('Tax not found');
    }

    if (tax.isDefault) {
      res.status(400);
      throw new Error('Cannot delete the default tax');
    }

    await Tax.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tax deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveTaxes,
  getAllTaxes,
  createTax,
  updateTax,
  deleteTax
};
