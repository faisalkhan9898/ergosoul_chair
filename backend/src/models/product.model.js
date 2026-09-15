const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, min: 0 },
  category: { type: String, required: true },
  mainCategory: { type: String, required: true, default: 'Chairs' },
  purpose: { type: String, required: true },
  images: [{ type: String, required: true }],
  threeSixtyImages: [{ type: String }], // Array of image URLs for rotating view
  videoUrl: { type: String },
  stock: { type: Number, required: true, min: 0, default: 10 },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  specs: {
    material: { type: String, required: true },
    color: [{ type: String, required: true }],
    brand: { type: String, default: 'Ergosoul' },
    height: { type: String }, // e.g. "105 - 115 cm"
    width: { type: String }, // e.g. "65 cm"
    weight: { type: String }, // e.g. "18 kg"
    weightCapacity: { type: String }, // e.g. "150 kg"
    armRest: { type: String }, // e.g. "4D Adjustable", "2D", "Fixed", "None"
    headRest: { type: String }, // e.g. "Adjustable", "Integrated", "None"
    reclining: { type: String }, // e.g. "Yes (90° - 135°)", "No"
    wheelType: { type: String } // e.g. "PU Casters", "Nylon Casters", "None"
  },
  warranty: { type: String, default: '3 Years' },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for search and filters
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ mainCategory: 1, category: 1, purpose: 1, price: 1 });

module.exports = mongoose.model('Product', ProductSchema);
