const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { createBlog, getAllBlogs, getBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { upload, resizeImage } = require('../middleware/upload');

router.route('/')
  .post(authenticateUser, authorizeAdmin, upload.single('coverImage'), resizeImage, createBlog)
  .get(getAllBlogs);

router.route('/:slug')
  .get(getBlog)
  .put(authenticateUser, authorizeAdmin, upload.single('coverImage'), resizeImage, updateBlog)
  .delete(authenticateUser, authorizeAdmin, deleteBlog);

module.exports = router;
