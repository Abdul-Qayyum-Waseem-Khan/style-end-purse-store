const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  selectedColor: {
    name: { type: String },
    hex: { type: String }
  },
  selectedSetOption: {
    name: { type: String },
    price: { type: Number },
    includedItems: { type: [String], default: [] }
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Required to link orders to customers for returns
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'jazzcash', 'card', 'raast'],
    required: true
  },
  paymentDetails: {
    phone: String, // For jazzcash
    transactionId: String // For card/raast
  },
  orderNotes: {
    type: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
  },
  freeGiftDescription: {
    type: String,
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'dispatched', 'at_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'dispatched', 'at_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
        required: true
      },
      note: {
        type: String
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  expectedDeliveryDate: {
    type: Date
  },
  visitorId: {
    type: String,
    index: true
  },
  attribution: {
    utmSource: { type: String, default: 'Direct' },
    utmMedium: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    utmTerm: { type: String, default: null },
    utmContent: { type: String, default: null },
    referrer: { type: String, default: null },
    landingPage: { type: String, default: null },
    firstVisitTimestamp: { type: Date, default: null },
  }
}, {
  timestamps: true
});

orderSchema.pre('save', function() {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status || 'pending',
      note: 'Order created',
      timestamp: Date.now()
    });
  }
});

module.exports = mongoose.model('Order', orderSchema);
