const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_gift'],
      required: true,
    },
    value: {
      type: Number,
      required: function() { return this.type !== 'free_gift'; }
    },
    giftDescription: {
      type: String,
      required: function() { return this.type === 'free_gift'; }
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    usageLimit: {
      type: Number, // null or 0 means unlimited
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableToFirstOrderOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', CouponSchema);
