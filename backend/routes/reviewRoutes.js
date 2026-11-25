const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

const {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviewsAdmin,
  toggleReviewApproval,
  updateReviewAdmin,
} = require('../controllers/reviewController');

const { authorizeAdmin } = require('../middleware/auth');

router.route('/')
  .post(authenticateUser, createReview);

router.route('/:id')
  .delete(authenticateUser, deleteReview);

router.route('/product/:id')
  .get(getProductReviews);

// Admin Routes
router.route('/admin')
  .get(authenticateUser, authorizeAdmin, getAllReviewsAdmin);

router.route('/admin/:id/toggle-approval')
  .put(authenticateUser, authorizeAdmin, toggleReviewApproval);

router.route('/admin/:id')
  .put(authenticateUser, authorizeAdmin, updateReviewAdmin)
  .delete(authenticateUser, authorizeAdmin, deleteReview);

module.exports = router;
