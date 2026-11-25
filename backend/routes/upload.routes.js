const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');

// Setup specific storage for hero banners
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'hero-banners',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
    };
  },
});

const bannerUpload = multer({
  storage: bannerStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Route: POST /api/upload/banner-image
router.post('/banner-image', authenticateUser, authorizeAdmin, bannerUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.status(200).json({ imageUrl: req.file.path });
});

// Setup specific storage for product videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'style_end_purse_products',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'webm'],
      transformation: [
        { duration: "5.0" },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// Route: POST /api/upload/product-video
router.post('/product-video', authenticateUser, authorizeAdmin, videoUpload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video uploaded' });
  }
  res.status(200).json({ videoUrl: req.file.path });
});

// Route: GET /api/upload/signature
router.get('/signature', authenticateUser, authorizeAdmin, (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    // These must exactly match the frontend upload params (except file/api_key)
    const paramsToSign = {
      timestamp: timestamp,
      folder: 'style_end_purse_products',
      // Ensure transformation string matches exactly what frontend sends
      transformation: 'd_5.0,q_auto,f_auto'
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

module.exports = router;
