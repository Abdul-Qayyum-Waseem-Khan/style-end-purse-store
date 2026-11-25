const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      enum: [
        'responsive-carousel',
        'light-clean',
        'dark-tech',
        'gradient-wave',
        'split-showcase',
        'countdown-timer',
        'bold-minimal',
        'simple-elegance',
        'classic-split',
      ],
      default: 'responsive-carousel',
    },
    desktopImageUrl: { type: String, default: '' },
    mobileImageUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    imageAlt: { type: String, default: 'Style End Purse Collection' },
    sortOrder: { type: Number, default: 0 },
    showTextOverlay: { type: Boolean, default: false },
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    discount: { type: String, default: '' },
    description: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    buttonPosition: {
      type: String,
      enum: ['bottom-left', 'bottom-center', 'bottom-right', 'center'],
      default: 'bottom-left',
    },
    secondaryButtonText: { type: String, default: '' },
    secondaryButtonLink: { type: String, default: '' },
    floatingTagSubtitle: { type: String, default: '' },
    floatingTagTitle: { type: String, default: '' },
    floatingTagPrice: { type: String, default: '' },
    badge1Text: { type: String, default: '' },
    badge2Text: { type: String, default: '' },
    additionalImages: [{ type: String }],
    originalPrice: { type: String, default: '' },
    salePrice: { type: String, default: '' },
    stockPercent: { type: Number, default: 75 },
    expiresAt: { type: String },
    freeDeliveryNote: { type: String, default: '' },
    featuredProducts: [{
      name: { type: String },
      price: { type: String },
      image: { type: String },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroBanner', heroBannerSchema);
