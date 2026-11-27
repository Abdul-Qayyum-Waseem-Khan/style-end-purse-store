const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/adminOnly');
const { upload, resizeImage } = require('../middleware/upload');

const {
  getProducts,
  getAdminProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.get('/admin/all', authenticateUser, authorizeAdmin, getAdminProducts);
router.put('/admin/bulk-update', authenticateUser, authorizeAdmin, bulkUpdateProducts);
router.post('/', authenticateUser, authorizeAdmin, upload.array('images', 8), resizeImage, createProduct);
router.put('/:id', authenticateUser, authorizeAdmin, upload.array('images', 8), resizeImage, updateProduct);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteProduct);

module.exports = router;
