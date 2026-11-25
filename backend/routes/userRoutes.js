const express = require('express');
const router = express.Router();
const { upload, resizeImage } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
} = require('../controllers/userController');

// All routes are protected
router.use(protect);

// Profile
router.put('/profile', upload.single('avatar'), resizeImage, updateProfile);

// Addresses
router.route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router.route('/addresses/:id')
  .put(updateAddress)
  .delete(deleteAddress);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
