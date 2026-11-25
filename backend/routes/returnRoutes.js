const express = require('express');
const router = express.Router();
const {
  createReturnRequest,
  getReturnRequests,
  updateReturnStatus,
  getReturnRequestById
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/auth');
const { upload, resizeImage } = require('../middleware/upload');

// Note: createReturnRequest is protected, but if we want guests to return via tracking ID, 
// we'd need a separate non-protected route or make it optional. 
// For now, protecting it ensures secure returns.
router.post('/', protect, upload.array('images', 5), resizeImage, createReturnRequest);

// Admin routes
router.get('/', protect, authorize('admin'), getReturnRequests);
router.put('/:id/status', protect, authorize('admin'), updateReturnStatus);

// User route for specific return
router.get('/:id', protect, getReturnRequestById);

module.exports = router;
