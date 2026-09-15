const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const Tax = require('../models/tax.model');

// Helper to calculate pricing
const calculateOrderDetails = async (items, couponCode) => {
  let subtotal = 0;
  
  // Calculate subtotal
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found with id: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
    subtotal += product.price * item.quantity;
  }

  // Calculate discount
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && coupon.expiresAt > Date.now() && subtotal >= coupon.minPurchase) {
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountAmount) / 100;
      } else {
        discountAmount = coupon.discountAmount;
      }
    }
  }

  // flat rates
  const shippingCharges = subtotal > 1000 ? 0 : 150; // Free shipping above 1000
  const defaultTax = await Tax.findOne({ isDefault: true, isActive: true }) || { rate: 18 };
  const tax = Math.round((subtotal - discountAmount) * (defaultTax.rate / 100));
  const totalAmount = subtotal - discountAmount + shippingCharges + tax;

  return {
    subtotal,
    discountAmount,
    shippingCharges,
    tax,
    totalAmount
  };
};

// @desc    Create a new order & pay (or mock payment)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, paymentId } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // Calc costs
    const { shippingCharges, tax, discountAmount, totalAmount } = await calculateOrderDetails(items, couponCode);

    // Create tracking timeline
    const trackingHistory = [
      {
        status: 'Order Placed',
        description: 'Your order has been successfully placed and is pending payment/verification.'
      }
    ];

    // Build the order document
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        id: paymentId || `MOCK_TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        status: paymentMethod === 'COD' ? 'Pending' : 'Paid'
      },
      shippingCharges,
      tax,
      couponDiscount: discountAmount,
      totalAmount,
      orderStatus: 'Pending',
      trackingHistory
    });

    // Update product stock and order status
    for (const item of items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    if (order.paymentInfo.status === 'Paid') {
      order.trackingHistory.push({
        status: 'Paid',
        description: `Payment verification successful via ${paymentMethod}.`
      });
      order.orderStatus = 'Processing';
    }

    const createdOrder = await order.save();
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images price slug');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Access check: only user who placed it or an admin can access
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status / tracking timeline (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = status || order.orderStatus;
    
    order.trackingHistory.push({
      status: status,
      description: description || `Order state updated to ${status}.`,
      date: new Date()
    });

    if (status === 'Delivered') {
      order.paymentInfo.status = 'Paid'; // COD updates payment
    }

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate gateway sessions (Stripe / Razorpay Intent creators)
// @route   POST /api/orders/pay-session
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { items, couponCode, gateway } = req.body;
    const { totalAmount } = await calculateOrderDetails(items, couponCode);

    // Simulated Stripe / Razorpay checkout session responses
    if (gateway === 'stripe') {
      res.json({
        success: true,
        clientSecret: `pi_mock_secret_${Math.random().toString(36).substring(7)}`,
        totalAmount,
        publishableKey: 'pk_test_mock_Ergosoul_publishable_key'
      });
    } else if (gateway === 'razorpay') {
      res.json({
        success: true,
        id: `order_mock_${Math.random().toString(36).substring(7)}`,
        amount: totalAmount * 100, // Razorpay in paisa
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });
    } else {
      res.status(400);
      throw new Error('Invalid gateway requested');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createPaymentIntent
};
