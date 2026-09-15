const mongoose = require('mongoose');

const TaxSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  rate: { type: Number, required: true, min: 0, max: 100 },
  description: { type: String, trim: true },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save hook: if setting this one as default, unset others.
TaxSchema.pre('save', async function () {
  if (this.isDefault) {
    // Set isDefault to false for all other taxes
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

module.exports = mongoose.model('Tax', TaxSchema);
