const Setting = require('../models/Setting');
const User = require('../models/User');

// @route   GET /api/v1/store/stats
// @desc    Get public store stats (like customer count) based on settings
// @access  Public
exports.getStoreStats = async (req, res) => {
  try {
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    const stats = {
      showCustomerCount: settingsObj.showCustomerCount === true || settingsObj.showCustomerCount === 'true',
      newsletterOfferTitle: settingsObj.newsletterOfferTitle || 'Get 10% OFF Your First Order!',
      newsletterOfferSubtitle: settingsObj.newsletterOfferSubtitle || 'Subscribe to our newsletter and receive exclusive deals, health tips, and new product updates.',
      trustBadges: settingsObj.trustBadges || [
        { icon: 'Shield', title: '100% Authentic', subtitle: 'Sourced directly from authorized distributors' },
        { icon: 'Truck', title: 'Fast Delivery', subtitle: 'Same-day delivery available across Karachi' },
        { icon: 'Users', title: 'Expert Guidance', subtitle: 'Free consultation with certified nutritionists' },
        { icon: 'Gift', title: 'Free Gifts', subtitle: 'Surprise gifts on orders above PKR 3,000' }
      ],
      socialLinks: {
        facebook: settingsObj.facebookLink || '',
        instagram: settingsObj.instagramLink || '',
        linkedin: settingsObj.linkedinLink || ''
      }
    };

    if (stats.showCustomerCount) {
      const userCount = await User.countDocuments({ role: 'user' });
      stats.customerCount = userCount;
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
