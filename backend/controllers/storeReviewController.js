const StoreReview = require('../models/StoreReview');

// @route   GET /api/v1/store-reviews/public
// @desc    Get all approved store reviews
// @access  Public
exports.getPublicStoreReviews = async (req, res) => {
  try {
    const reviews = await StoreReview.find({ isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10); // Show top 10 recent approved reviews
      
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   GET /api/v1/store-reviews/me
// @desc    Get current user's store review
// @access  Private
exports.getMyStoreReview = async (req, res) => {
  try {
    const review = await StoreReview.findOne({ user: req.user.id });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   POST /api/v1/store-reviews
// @desc    Create or update store review
// @access  Private
exports.createOrUpdateStoreReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    let review = await StoreReview.findOne({ user: req.user.id });
    
    if (review) {
      // Update existing review (requires re-approval)
      review.rating = rating;
      review.comment = comment;
      review.isApproved = false; // reset approval on edit
      await review.save();
      res.status(200).json({ success: true, data: review, message: 'Review updated and pending approval' });
    } else {
      // Create new review
      review = await StoreReview.create({
        rating,
        comment,
        user: req.user.id,
        isApproved: false
      });
      res.status(201).json({ success: true, data: review, message: 'Review submitted and pending approval' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   GET /api/v1/store-reviews/admin
// @desc    Get all store reviews (admin)
// @access  Private/Admin
exports.getAllStoreReviewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    
    let query = {};
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    
    const total = await StoreReview.countDocuments(query);
    const reviews = await StoreReview.find(query)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);
      
    res.status(200).json({ 
      success: true, 
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   PUT /api/v1/store-reviews/admin/:id/toggle-approval
// @desc    Toggle review approval
// @access  Private/Admin
exports.toggleReviewApproval = async (req, res) => {
  try {
    const review = await StoreReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    review.isApproved = !review.isApproved;
    await review.save();
    
    // populate user before returning
    await review.populate('user', 'name email avatar');
    
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   DELETE /api/v1/store-reviews/admin/:id
// @desc    Delete a review
// @access  Private/Admin
exports.deleteStoreReview = async (req, res) => {
  try {
    const review = await StoreReview.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
// @route   PUT /api/v1/store-reviews/admin/:id
// @desc    Update a store review
// @access  Private/Admin
exports.updateStoreReviewAdmin = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await StoreReview.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    await review.save();
    await review.populate('user', 'name email avatar');
    
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
