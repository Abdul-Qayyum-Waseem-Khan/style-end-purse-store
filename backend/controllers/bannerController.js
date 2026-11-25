const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { deleteCloudinaryImage } = require('../utils/cloudinaryUtils');

const createBanner = async (req, res) => {
  let bannerData = { ...req.body };

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'style_end_purse_banners' });
    bannerData.image = result.secure_url;
    fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
  }

  if (bannerData.isActive === 'true') bannerData.isActive = true;
  if (bannerData.isActive === 'false') bannerData.isActive = false;

  if (typeof bannerData.placements === 'string') {
    try {
      bannerData.placements = JSON.parse(bannerData.placements);
    } catch {
      bannerData.placements = bannerData.placements.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const banner = await Banner.create(bannerData);
  res.status(201).json({ data: banner });
};

const getAllBanners = async (req, res) => {
  const query = {};
  if (req.query.admin !== 'true') {
    query.isActive = true;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }

  const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
  res.status(200).json({ data: banners });
};

const updateBanner = async (req, res) => {
  const existingBanner = await Banner.findById(req.params.id);
  if (!existingBanner) return res.status(404).json({ error: 'Banner not found' });

  let bannerData = { ...req.body };

  if (req.file) {
    // Delete old image from cloudinary
    if (existingBanner.image) {
      await deleteCloudinaryImage(existingBanner.image);
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'style_end_purse_banners' });
    bannerData.image = result.secure_url;
    fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
  }

  if (bannerData.isActive === 'true') bannerData.isActive = true;
  if (bannerData.isActive === 'false') bannerData.isActive = false;

  if (typeof bannerData.placements === 'string') {
    try {
      bannerData.placements = JSON.parse(bannerData.placements);
    } catch {
      bannerData.placements = bannerData.placements.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const banner = await Banner.findByIdAndUpdate(req.params.id, bannerData, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!banner) return res.status(404).json({ error: 'Banner not found' });
  res.status(200).json({ data: banner });
};

const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ error: 'Banner not found' });

  // Delete image from cloudinary
  if (banner.image) {
    await deleteCloudinaryImage(banner.image);
  }

  res.status(200).json({ message: 'Banner deleted' });
};

module.exports = { createBanner, getAllBanners, updateBanner, deleteBanner };
