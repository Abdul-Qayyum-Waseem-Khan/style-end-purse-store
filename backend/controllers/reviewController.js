const Review = require('../models/Review');
const Product = require('../models/Product');

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct) {
    return res.status(404).json({ error: `No product with id : ${productId}` });
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    return res.status(400).json({ error: 'Already submitted review for this product' });
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);

  res.status(201).json({ review });
};

const getProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const reviews = await Review.paginate(
    { product: productId, isApproved: { $ne: false } },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'user', select: 'name avatar' },
    }
  );

  res.status(200).json({ reviews });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: `No review with id ${reviewId}` });
  }

  // Check permissions (Admin or the user who created it)
  if (req.user.role !== 'admin' && review.user.toString() !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized to delete this review' });
  }

  await review.deleteOne();
  res.status(200).json({ message: 'Success! Review removed' });
};

const getAllReviewsAdmin = async (req, res) => {
  const status = req.query.status;
  let query = {};
  
  if (status === 'pending') query.isApproved = false;
  if (status === 'approved') query.isApproved = true;

  const reviews = await Review.find(query)
    .populate({ path: 'user', select: 'name email avatar' })
    .populate({ path: 'product', select: 'name image slug' })
    .sort({ createdAt: -1 });

  res.status(200).json({ data: reviews });
};

const toggleReviewApproval = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: `No review with id ${reviewId}` });
  }

  review.isApproved = !review.isApproved;
  await review.save();

  res.status(200).json({ data: review });
};

const updateReviewAdmin = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: `No review with id ${reviewId}` });
  }

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;
  
  await review.save();

  res.status(200).json({ data: review });
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviewsAdmin,
  toggleReviewApproval,
  updateReviewAdmin,
};
