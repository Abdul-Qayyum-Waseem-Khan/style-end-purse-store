const express = require('express');
const router = express.Router();
const {
  getPublicStoreReviews,
  getMyStoreReview,
  createOrUpdateStoreReview,
  getAllStoreReviewsAdmin,
  toggleReviewApproval,
  deleteStoreReview,
  updateStoreReviewAdmin
} = require('../controllers/storeReviewController');

const { protect, authorize } = require('../middleware/auth');

// Public route
router.get('/public', getPublicStoreReviews);

// Protected user routes
router.get('/me', protect, getMyStoreReview);
router.post('/', protect, createOrUpdateStoreReview);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllStoreReviewsAdmin);
router.put('/admin/:id/toggle-approval', protect, authorize('admin'), toggleReviewApproval);
router.put('/admin/:id', protect, authorize('admin'), updateStoreReviewAdmin);
router.delete('/admin/:id', protect, authorize('admin'), deleteStoreReview);

module.exports = router;
