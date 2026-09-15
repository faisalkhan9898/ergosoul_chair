const express = require('express');
const router = express.Router();
const {
  getActiveTaxes,
  getAllTaxes,
  createTax,
  updateTax,
  deleteTax
} = require('../controllers/tax.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public route to get active taxes
router.get('/', getActiveTaxes);

// Admin routes
router.get('/admin', verifyToken, isAdmin, getAllTaxes);
router.post('/', verifyToken, isAdmin, createTax);
router.put('/:id', verifyToken, isAdmin, updateTax);
router.delete('/:id', verifyToken, isAdmin, deleteTax);

module.exports = router;
