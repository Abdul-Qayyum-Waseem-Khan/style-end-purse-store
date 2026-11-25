const cloudinary = require('../config/cloudinary');

/**
 * Safely deletes an asset (image or video) from Cloudinary based on its secure URL.
 * Automatically extracts the folder, public ID, and resource type from the URL.
 * @param {string} url - The Cloudinary secure_url
 */
const deleteCloudinaryImage = async (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary')) return;
  try {
    const isVideo = url.includes('/video/upload/');
    const resourceType = isVideo ? 'video' : 'image';

    const parts = url.split('/');
    const filename = parts.pop();
    const folder = parts.pop();
    if (!filename || !folder) return;
    const publicId = `${folder}/${filename.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
  }
};

module.exports = { deleteCloudinaryImage };
