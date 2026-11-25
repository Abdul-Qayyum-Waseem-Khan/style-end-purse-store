const mongoose = require('mongoose');

const StoreReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A user can only submit one store review
StoreReviewSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('StoreReview', StoreReviewSchema);
