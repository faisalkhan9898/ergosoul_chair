const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  symbol: { type: String, required: true },
  exchangeRate: { type: Number, required: true, default: 1.0, min: 0 },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save hook: if setting this one as default, unset others.
CurrencySchema.pre('save', async function () {
  if (this.isDefault) {
    // Set isDefault to false for all other currencies
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

module.exports = mongoose.model('Currency', CurrencySchema);
