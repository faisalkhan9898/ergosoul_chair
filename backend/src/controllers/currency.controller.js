const Currency = require('../models/currency.model');

// @desc    Get all active currencies (Public)
// @route   GET /api/currencies
// @access  Public
const getActiveCurrencies = async (req, res, next) => {
  try {
    const currencies = await Currency.find({ isActive: true }).sort({ isDefault: -1, code: 1 });
    res.json({ success: true, currencies });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all currencies (Admin only)
// @route   GET /api/currencies/admin
// @access  Private/Admin
const getAllCurrencies = async (req, res, next) => {
  try {
    const currencies = await Currency.find({}).sort({ isDefault: -1, code: 1 });
    res.json({ success: true, currencies });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a currency (Admin only)
// @route   POST /api/currencies
// @access  Private/Admin
const createCurrency = async (req, res, next) => {
  try {
    const { code, symbol, exchangeRate, isDefault, isActive } = req.body;

    const currencyExists = await Currency.findOne({ code: code.toUpperCase() });
    if (currencyExists) {
      res.status(400);
      throw new Error('Currency code already exists');
    }

    const currency = new Currency({
      code: code.toUpperCase(),
      symbol,
      exchangeRate: Number(exchangeRate),
      isDefault: isDefault || false,
      isActive: isActive !== undefined ? isActive : true
    });

    await currency.save();
    res.status(201).json({ success: true, currency });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a currency (Admin only)
// @route   PUT /api/currencies/:id
// @access  Private/Admin
const updateCurrency = async (req, res, next) => {
  try {
    const { code, symbol, exchangeRate, isDefault, isActive } = req.body;

    const currency = await Currency.findById(req.params.id);
    if (!currency) {
      res.status(404);
      throw new Error('Currency not found');
    }

    // If changing default status from true to false, prevent it if this is the only default currency
    if (currency.isDefault && isDefault === false) {
      const otherDefaults = await Currency.countDocuments({ _id: { $ne: req.params.id }, isDefault: true });
      if (otherDefaults === 0) {
        res.status(400);
        throw new Error('Must have at least one default currency');
      }
    }

    // Prevent deactivating the default currency
    if ((isDefault === true || (isDefault === undefined && currency.isDefault)) && isActive === false) {
      res.status(400);
      throw new Error('Default currency must be active');
    }

    currency.code = code ? code.toUpperCase() : currency.code;
    currency.symbol = symbol || currency.symbol;
    currency.exchangeRate = exchangeRate !== undefined ? Number(exchangeRate) : currency.exchangeRate;
    currency.isDefault = isDefault !== undefined ? isDefault : currency.isDefault;
    currency.isActive = isActive !== undefined ? isActive : currency.isActive;

    await currency.save();
    res.json({ success: true, currency });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a currency (Admin only)
// @route   DELETE /api/currencies/:id
// @access  Private/Admin
const deleteCurrency = async (req, res, next) => {
  try {
    const currency = await Currency.findById(req.params.id);
    if (!currency) {
      res.status(404);
      throw new Error('Currency not found');
    }

    if (currency.isDefault) {
      res.status(400);
      throw new Error('Cannot delete the default currency');
    }

    await Currency.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Currency deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveCurrencies,
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency
};
