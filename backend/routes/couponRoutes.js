const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// Public route for storefront validation
// Note: We might want to use optional authentication here, 
// so we'll handle the token inside the controller manually or use a custom optional middleware.
// For now, we'll keep it public and let the controller check `req.user` if we inject it or pass from body.
// To inject `req.user` if token exists but not fail if it doesn't, we can use a custom middleware.
// Let's just use `protect` optionally by checking headers in controller or pass it manually. 
// Actually, standard `protect` rejects if no token. We'll handle it inside controller via body token or frontend passing email/id.
// Wait, the frontend `axiosInstance` automatically sends cookies. So `protect` is easy, but we want guest access too!
// Let's create an optional auth middleware inline.

const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // ignore error, treat as guest
    }
  }
  next();
};

router.post('/validate', optionalAuth, validateCoupon);

// Admin routes
router.use(protect, authorize('admin'));
router.route('/')
  .get(getCoupons)
  .post(createCoupon);

router.route('/:id')
  .get(getCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
