const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single coupon
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to create coupon' });
  }
};

// @desc    Update a coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });

    coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message || 'Failed to update coupon' });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Validate a coupon code
// @route   POST /api/v1/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Please provide a coupon code' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) return res.status(404).json({ success: false, error: 'Invalid coupon code' });

    if (!coupon.isActive) return res.status(400).json({ success: false, error: 'Coupon is not active' });

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, error: `Minimum order amount of Rs. ${coupon.minOrderAmount} required` });
    }

    // Check first order logic
    if (coupon.applicableToFirstOrderOnly) {
      let email;
      let userId;

      // Extract from user token if logged in
      if (req.user) {
        userId = req.user.id;
        email = req.user.email;
      } else {
        // We will pass email from checkout form to validate if not logged in
        email = req.body.email;
      }

      if (!email && !userId) {
         return res.status(400).json({ success: false, error: 'Email or Login required to use first purchase coupons' });
      }

      // Check how many orders they have
      let orderQuery = {};
      if (userId) {
        orderQuery = { user: userId };
      } else if (email) {
        // Look up by user email first
        const existingUser = await User.findOne({ email });
        if (existingUser) {
           orderQuery = { user: existingUser._id };
        } else {
           // Not found as user, could be guest. Search order by contact email?
           // The Order model doesn't store email directly except via user. Wait, let me check Order.js again.
           // Our Order model does not store email! It only has `shippingAddress.fullName`.
           // So guest tracking by email is impossible unless we add email to shippingAddress or Order!
        }
      }

      // To simplify, if FirstOrderOnly, we strictly require a logged in user OR we check orders belonging to user ID.
      // If guest (no userId), we can't reliably prove it's their first order because we don't store guest emails in Order.
      // Wait, let me add `email` to Order model shippingAddress or top level to be safe, but for now:
      if (!userId) {
         return res.status(401).json({ success: false, error: 'Please login or create an account to claim your first purchase offer!' });
      }

      const pastOrdersCount = await Order.countDocuments(orderQuery);
      if (pastOrdersCount > 0) {
        return res.status(400).json({ success: false, error: 'This coupon is only valid for your first purchase.' });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }

    // Prevent discount from exceeding subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    res.status(200).json({ 
      success: true, 
      data: {
        code: coupon.code,
        type: coupon.type,
        discountAmount,
        giftDescription: coupon.giftDescription
      } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
