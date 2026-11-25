const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
    },
    link: {
      type: String,
      default: '/',
    },
    image: {
      type: String,
      default: '',
    },
    colorGradient: {
      type: String,
      trim: true,
    },
    colorTheme: {
      type: String,
      default: 'gold-noir', // 'gold-noir', 'rose-gold', 'emerald-chic', 'sunset-crimson', 'obsidian'
    },
    type: {
      type: String,
      enum: ['hero', 'flash_sale', 'top_bar', 'popup'],
      default: 'flash_sale',
    },
    badgeText: {
      type: String,
      default: 'LIMITED TIME OFFER',
      trim: true,
    },
    discountOffer: {
      type: String,
      trim: true,
      default: 'Up to 40% OFF',
    },
    originalPrice: {
      type: String,
      trim: true,
    },
    salePrice: {
      type: String,
      trim: true,
    },
    stockPercent: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    endDate: {
      type: Date, // Used for flash sale & countdown timers
    },
    templateDesign: {
      type: String,
      default: 'luxury_card', // 'luxury_card', 'sticky_bar', 'glass_floating', 'ticker_bar'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    placements: {
      type: [String],
      default: ['top_header', 'mid_page', 'gift_box'], // 'top_header', 'mid_page', 'gift_box'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);
