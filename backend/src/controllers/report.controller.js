const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

// @desc    Get detailed sales & revenue report
// @route   GET /api/reports/sales
// @access  Admin
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, orderStatus, paymentStatus, paymentMethod } = req.query;

    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (orderStatus && orderStatus !== 'all') {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query['paymentInfo.status'] = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query['paymentInfo.method'] = paymentMethod;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name category mainCategory price images')
      .sort({ createdAt: -1 });

    // Aggregate summary metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const totalShipping = orders.reduce((sum, o) => sum + (o.shippingCharges || 0), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + (o.couponDiscount || 0), 0);
    const paidOrders = orders.filter(o => o.paymentInfo?.status === 'Paid');
    const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    res.json({
      success: true,
      summary: {
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        paidRevenue: Number(paidRevenue.toFixed(2)),
        paidOrdersCount: paidOrders.length,
        totalTax: Number(totalTax.toFixed(2)),
        totalShipping: Number(totalShipping.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        averageOrderValue: Number(averageOrderValue)
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed inventory & stock valuation report
// @route   GET /api/reports/inventory
// @access  Admin
const getInventoryReport = async (req, res, next) => {
  try {
    const { mainCategory, category, stockStatus } = req.query;

    const query = {};

    if (mainCategory && mainCategory !== 'all') {
      query.mainCategory = mainCategory;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (stockStatus === 'out_of_stock') {
      query.stock = 0;
    } else if (stockStatus === 'low_stock') {
      query.stock = { $gt: 0, $lte: 3 };
    } else if (stockStatus === 'in_stock') {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query)
      .select('name slug price oldPrice stock mainCategory category specs ratings images createdAt')
      .sort({ stock: 1, name: 1 });

    // Aggregate summary metrics
    const totalItems = products.length;
    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalStockValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 3).length;
    const averageItemPrice = totalItems > 0 ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / totalItems).toFixed(2) : 0;

    res.json({
      success: true,
      summary: {
        totalItems,
        totalStockUnits,
        totalStockValue: Number(totalStockValue.toFixed(2)),
        outOfStockCount,
        lowStockCount,
        inStockCount: totalItems - outOfStockCount,
        averageItemPrice: Number(averageItemPrice)
      },
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category/department performance report
// @route   GET /api/reports/categories
// @access  Admin
const getCategoryReport = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 });
    const allProducts = await Product.find({}).select('mainCategory category price stock');
    const allOrders = await Order.find({}).populate('items.product', 'mainCategory category price');

    const reportData = categories.map(cat => {
      const prods = allProducts.filter(p => p.mainCategory === cat.name);
      const totalModels = prods.length;
      const totalStock = prods.reduce((sum, p) => sum + (p.stock || 0), 0);
      const totalValue = prods.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
      const avgPrice = totalModels > 0 ? (prods.reduce((sum, p) => sum + (p.price || 0), 0) / totalModels).toFixed(2) : 0;

      // Calculate units sold for this department from orders
      let unitsSold = 0;
      let revenueSold = 0;

      allOrders.forEach(order => {
        order.items?.forEach(item => {
          if (item.product?.mainCategory === cat.name) {
            unitsSold += item.quantity || 0;
            revenueSold += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      return {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon,
        isActive: cat.isActive,
        displayOrder: cat.displayOrder,
        subcategoriesCount: cat.subcategories?.length || 0,
        subcategories: cat.subcategories || [],
        totalModels,
        totalStock,
        totalStockValue: Number(totalValue.toFixed(2)),
        averagePrice: Number(avgPrice),
        unitsSold,
        revenueSold: Number(revenueSold.toFixed(2))
      };
    });

    res.json({
      success: true,
      categories: reportData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer purchase history report
// @route   GET /api/reports/customers
// @access  Admin
const getCustomerReport = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email phoneNumber isVerified createdAt addresses');

    const allOrders = await Order.find({}).sort({ createdAt: -1 });

    const customerData = customers.map(cust => {
      const custOrders = allOrders.filter(o => o.user?.toString() === cust._id.toString());
      const totalSpent = custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const paidOrders = custOrders.filter(o => o.paymentInfo?.status === 'Paid');
      const latestOrder = custOrders[0]?.createdAt || null;

      return {
        _id: cust._id,
        name: cust.name,
        email: cust.email,
        phoneNumber: cust.phoneNumber || cust.addresses?.[0]?.phoneNumber || 'N/A',
        isVerified: cust.isVerified,
        totalOrders: custOrders.length,
        paidOrdersCount: paidOrders.length,
        totalSpent: Number(totalSpent.toFixed(2)),
        latestOrder,
        registeredAt: cust.createdAt
      };
    });

    // Sort by highest spenders first
    customerData.sort((a, b) => b.totalSpent - a.totalSpent);

    res.json({
      success: true,
      customers: customerData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalesReport,
  getInventoryReport,
  getCategoryReport,
  getCustomerReport
};
