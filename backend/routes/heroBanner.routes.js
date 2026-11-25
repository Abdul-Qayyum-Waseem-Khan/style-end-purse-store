const express = require('express');
const router = express.Router();
const HeroBanner = require('../models/HeroBanner.model');
const { authenticateUser, authorizeAdmin } = require('../middleware/auth');
const { deleteCloudinaryImage } = require('../utils/cloudinaryUtils');

// 1. GET /api/hero-banner/active (returns all active slides sorted by sortOrder)
router.get('/active', async (req, res) => {
  const activeSlides = await HeroBanner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
  res.status(200).json({
    slides: activeSlides,
    ...(activeSlides[0] ? activeSlides[0].toObject() : {}),
  });
});

// 2. GET /api/hero-banner/all
router.get('/all', authenticateUser, authorizeAdmin, async (req, res) => {
  const banners = await HeroBanner.find().sort({ sortOrder: 1, createdAt: -1 });
  res.status(200).json(banners);
});

// 3. POST /api/hero-banner/create
router.post('/create', authenticateUser, authorizeAdmin, async (req, res) => {
  const newBanner = new HeroBanner(req.body);
  const savedBanner = await newBanner.save();
  res.status(201).json(savedBanner);
});

// 4. PUT /api/hero-banner/toggle/:id (toggle active state for multi-slide carousel)
router.put('/toggle/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const banner = await HeroBanner.findById(id);
  if (!banner) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  banner.isActive = !banner.isActive;
  await banner.save();
  res.status(200).json(banner);
});

// 5. PUT /api/hero-banner/activate/:id (legacy single-activate kept for compatibility)
router.put('/activate/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const updatedBanner = await HeroBanner.findByIdAndUpdate(
    id,
    { isActive: true },
    { returnDocument: 'after' }
  );
  if (!updatedBanner) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  res.status(200).json(updatedBanner);
});

// 6. PUT /api/hero-banner/update/:id
router.put('/update/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const oldBanner = await HeroBanner.findById(id);
  if (!oldBanner) return res.status(404).json({ error: 'Banner not found' });

  // Delete removed images from Cloudinary
  const oldUrls = [oldBanner.imageUrl, oldBanner.desktopImageUrl, oldBanner.mobileImageUrl].filter(Boolean);
  const newUrls = [req.body.imageUrl, req.body.desktopImageUrl, req.body.mobileImageUrl].filter(Boolean);
  for (const oldUrl of oldUrls) {
    if (!newUrls.includes(oldUrl)) {
      await deleteCloudinaryImage(oldUrl);
    }
  }

  const oldAdditional = oldBanner.additionalImages || [];
  const newAdditional = req.body.additionalImages || [];
  for (const oldImg of oldAdditional) {
    if (!newAdditional.includes(oldImg)) {
      await deleteCloudinaryImage(oldImg);
    }
  }

  const updatedBanner = await HeroBanner.findByIdAndUpdate(
    id,
    req.body,
    { returnDocument: 'after', runValidators: true }
  );
  if (!updatedBanner) {
    return res.status(404).json({ error: 'Banner not found' });
  }
  res.status(200).json(updatedBanner);
});

// 7. DELETE /api/hero-banner/:id
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const banner = await HeroBanner.findById(id);

  if (!banner) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  const urlsToDelete = [banner.imageUrl, banner.desktopImageUrl, banner.mobileImageUrl].filter(Boolean);
  for (const url of urlsToDelete) {
    await deleteCloudinaryImage(url);
  }
  if (banner.additionalImages) {
    for (const img of banner.additionalImages) {
      await deleteCloudinaryImage(img);
    }
  }

  await banner.deleteOne();
  res.status(200).json({ message: 'Banner deleted successfully' });
});

module.exports = router;
