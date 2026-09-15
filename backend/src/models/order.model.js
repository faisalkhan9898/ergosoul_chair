const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  color: { type: String }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  paymentInfo: {
    id: { type: String }, // payment gateway tx id
    method: { type: String, enum: ['Stripe', 'Razorpay', 'UPI', 'COD'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' }
  },
  shippingCharges: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  trackingNumber: { type: String },
  trackingHistory: [
    {
      status: { type: String },
      description: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
