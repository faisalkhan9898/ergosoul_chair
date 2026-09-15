const Coupon = require('../models/coupon.model');

// @desc    Validate a promo coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code is invalid or inactive' });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase of $${coupon.minPurchase} required to apply this coupon` 
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountAmount, minPurchase, expiresAt } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountAmount: Number(discountAmount),
      minPurchase: minPurchase ? Number(minPurchase) : 0,
      expiresAt: new Date(expiresAt)
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
};
