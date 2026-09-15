const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  comment: { type: String, required: true, trim: true },
  recommends: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Enforce unique review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
