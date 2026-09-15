const Review = require('../models/review.model');
const Product = require('../models/product.model');

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, recommends } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      recommends: recommends !== undefined ? recommends : true
    });

    // Recalculate product ratings average and count
    const productReviews = await Review.find({ product: productId });
    const reviewsCount = productReviews.length;
    const avgRating = productReviews.reduce((acc, item) => item.rating + acc, 0) / reviewsCount;

    product.ratings.count = reviewsCount;
    product.ratings.average = Math.round(avgRating * 10) / 10; // e.g. 4.3
    await product.save();

    res.status(201).json({ success: true, review, ratings: product.ratings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews
};
