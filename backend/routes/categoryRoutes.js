const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/adminOnly');

const {
  getAllCategories,
  getAdminCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', authenticateUser, authorizeAdmin, getAdminCategories);
router.post('/', authenticateUser, authorizeAdmin, createCategory);
router.put('/:id', authenticateUser, authorizeAdmin, updateCategory);
router.delete('/:id', authenticateUser, authorizeAdmin, deleteCategory);

module.exports = router;
