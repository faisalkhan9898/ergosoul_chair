require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize database
connectDB();

const app = express();

// Standard middleware
app.use(cors({ origin: '*' })); // Enable global CORS for testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static assets route for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/blogs', require('./routes/blog.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/currencies', require('./routes/currency.routes'));
app.use('/api/taxes', require('./routes/tax.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Ergosoul Premium Furniture API' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Ergosoul Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
