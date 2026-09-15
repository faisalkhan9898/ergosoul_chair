const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analytics.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/dashboard', verifyToken, isAdmin, getDashboardMetrics);

module.exports = router;
