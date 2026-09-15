const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getInventoryReport,
  getCategoryReport,
  getCustomerReport
} = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All report routes require admin privileges
router.use(verifyToken, isAdmin);

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/categories', getCategoryReport);
router.get('/customers', getCustomerReport);

module.exports = router;
