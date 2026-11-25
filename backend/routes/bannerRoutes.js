const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { createBanner, getAllBanners, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { upload, resizeImage } = require('../middleware/upload');

router.route('/')
  .post(authenticateUser, authorizeAdmin, upload.single('image'), resizeImage, createBanner)
  .get(getAllBanners);

router.route('/:id')
  .put(authenticateUser, authorizeAdmin, upload.single('image'), resizeImage, updateBanner)
  .delete(authenticateUser, authorizeAdmin, deleteBanner);

module.exports = router;
