const express = require('express');
const router = express.Router();
const {
  getActiveCurrencies,
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency
} = require('../controllers/currency.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public route to get active currencies
router.get('/', getActiveCurrencies);

// Admin routes
router.get('/admin', verifyToken, isAdmin, getAllCurrencies);
router.post('/', verifyToken, isAdmin, createCurrency);
router.put('/:id', verifyToken, isAdmin, updateCurrency);
router.delete('/:id', verifyToken, isAdmin, deleteCurrency);

module.exports = router;
