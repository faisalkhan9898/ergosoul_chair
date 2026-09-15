const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  icon: { type: String, default: '📦' },
  image: { type: String, default: '' },
  subcategories: [{ type: String, trim: true }],
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

CategorySchema.index({ displayOrder: 1, name: 1 });

module.exports = mongoose.model('Category', CategorySchema);
