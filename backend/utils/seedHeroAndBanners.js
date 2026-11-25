require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const HeroBanner = require('../models/HeroBanner.model');
const Banner = require('../models/Banner');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/style_end_purse';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB for seeding Hero & Banners...');

    // 1. Seed Hero Banners (6 distinct luxury templates)
    const existingHeroCount = await HeroBanner.countDocuments();
    if (existingHeroCount === 0) {
      const heroTemplates = [
        {
          templateId: 'light-clean',
          eyebrow: 'STYLE END PURSE • ATELIER',
          title: 'The Parisian Elegance Handbag Collection',
          discount: 'NEW ARRIVALS • COMPLIMENTARY LUXURY PACKAGING',
          description: 'Exquisite designer handbags crafted from the finest Italian nappa leather. Timeless silhouettes designed for modern luxury.',
          buttonText: 'Explore Collection',
          buttonLink: '/category/handbags',
          secondaryButtonText: 'View 3-Piece Sets',
          secondaryButtonLink: '/category/sets',
          imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
          imageAlt: 'Style End Purse Luxury Atelier Tote',
          floatingTagSubtitle: 'Signature Atelier',
          floatingTagTitle: 'Quilted Top-Handle Luxury Purse',
          floatingTagPrice: 'PKR 6,450',
          badge1Text: 'Doorstep Inspection Available',
          badge2Text: 'Cash on Delivery Across Pakistan',
          originalPrice: 'PKR 9,500',
          salePrice: 'PKR 6,450',
          stockPercent: 82,
          freeDeliveryNote: 'Complimentary Delivery & Doorstep Inspection',
          featuredProducts: [
            { name: 'Classic Quilted Tote', price: 'PKR 6,450' },
            { name: 'Evening Minaudière', price: 'PKR 4,800' },
            { name: '3-Piece Trio Set', price: 'PKR 8,999' }
          ],
          isActive: true
        },
        {
          templateId: 'dark-tech',
          eyebrow: 'MIDNIGHT NOIR • SIGNATURE DROP',
          title: 'Obsidian & 24K Gold Hardware Edition',
          discount: 'EXCLUSIVE LIMITED RUN • ONLY 50 PIECES CRAFTED',
          description: 'Sleek black textured calfskin paired with custom-cast rust-proof gold hardware. Elevate your evening presence.',
          buttonText: 'Claim Your Piece',
          buttonLink: '/category/all',
          secondaryButtonText: 'View Lookbook',
          secondaryButtonLink: '/category/clutches',
          imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
          imageAlt: 'Obsidian Black Leather Purse',
          floatingTagSubtitle: 'Limited Edition',
          floatingTagTitle: 'Midnight Gold Clasp Crossbody',
          floatingTagPrice: 'PKR 7,950',
          badge1Text: '100% Genuine Full-Grain Leather',
          badge2Text: 'Rust-Proof 24K Gold Plating',
          isActive: false
        },
        {
          templateId: 'gradient-wave',
          eyebrow: 'SPRING / SUMMER 2026',
          title: 'Vibrant Pastel Chic & Day-To-Night Totes',
          discount: 'UP TO 35% OFF ON ALL ACCESSORIES',
          description: 'Lightweight, versatile purses in blush pink, champagne, and soft ivory to complement every wardrobe.',
          buttonText: 'Shop Summer Drop',
          buttonLink: '/category/all',
          secondaryButtonText: 'Matching Heels',
          secondaryButtonLink: '/category/shoes',
          imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
          imageAlt: 'Vibrant Luxury Purses',
          floatingTagSubtitle: 'Summer Hue',
          floatingTagTitle: 'Blush Leather Saddle Bag',
          floatingTagPrice: 'PKR 5,200',
          badge1Text: 'Ultra-Light Comfort Strap',
          badge2Text: 'Complimentary Dust Bag',
          isActive: false
        },
        {
          templateId: 'split-showcase',
          eyebrow: 'BESTSELLER SPOTLIGHT',
          title: 'The Royal 3-Piece Matching Trio Set',
          discount: 'SAVE PKR 4,000 ON COMPLETE SET',
          description: 'Includes our flagship structured tote, matching formal heels, and a zippered cosmetic pouch with matching gold accents.',
          buttonText: 'Get The Bundle',
          buttonLink: '/category/sets',
          secondaryButtonText: 'Explore Colors',
          secondaryButtonLink: '/category/sets',
          imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=85',
          imageAlt: '3-Piece Matching Set',
          floatingTagSubtitle: 'Complete Look',
          floatingTagTitle: 'Emerald & Gold 3-Piece Set',
          floatingTagPrice: 'PKR 15,500',
          originalPrice: 'PKR 19,500',
          salePrice: 'PKR 15,500',
          badge1Text: 'All 3 Items Included',
          badge2Text: 'Free Shipping Nationwide',
          isActive: false
        },
        {
          templateId: 'countdown-timer',
          eyebrow: 'FLASH LAUNCH • 24 HOURS ONLY',
          title: 'Midnight Flash Drop: Pearl Minaudière',
          discount: 'LIMITED QUANTITY • 45% OFF',
          description: 'Handcrafted pearl-encrusted clutches with detachable snake chain. Countdown ends tonight at midnight!',
          buttonText: 'Order Before Sold Out',
          buttonLink: '/category/clutches',
          imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85',
          imageAlt: 'Pearl Evening Clutch',
          originalPrice: 'PKR 8,900',
          salePrice: 'PKR 4,895',
          stockPercent: 91,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          badge1Text: 'Only 7 Units Remaining',
          badge2Text: 'Same-Day Dispatch in Lahore',
          isActive: false
        },
        {
          templateId: 'bold-minimal',
          eyebrow: 'EDITORIAL ESSENTIALS',
          title: 'PURE CRAFTSMANSHIP. UNCOMPROMISING FORM.',
          discount: 'NEW CAPSULE COLLECTION',
          description: 'Architectural lines and refined minimalism for the modern tastemaker.',
          buttonText: 'Discover Capsule',
          buttonLink: '/category/handbags',
          imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85',
          imageAlt: 'Minimalist High Fashion Bag',
          floatingTagSubtitle: 'Capsule 01',
          floatingTagTitle: 'Monochrome Structured Shoulder Bag',
          floatingTagPrice: 'PKR 5,900',
          badge1Text: 'Architectural Minimal Silhouette',
          badge2Text: 'Signature Gold Hardware',
          isActive: false
        }
      ];

      await HeroBanner.insertMany(heroTemplates);
      console.log('✅ Seeded 6 Hero Banner Templates');
    }

    // 2. Seed Flash Ads & Timer Ads (Multiple Templates)
    const tomorrow = new Date(Date.now() + 28 * 60 * 60 * 1000); // 28 hours from now

    const flashBanners = [
      {
        title: 'Midnight Flash Drop: Quilted Leather Clutches',
        subtitle: 'Complimentary Gold-Tone Strap & Free Express Shipping Nationwide',
        badgeText: 'FLASH DEAL • 24 HOURS ONLY',
        discountOffer: 'FLAT 40% OFF',
        originalPrice: 'PKR 7,500',
        salePrice: 'PKR 4,499',
        stockPercent: 86,
        endDate: tomorrow,
        link: '/category/clutches',
        buttonText: 'Claim Deal Now',
        image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
        type: 'flash_sale',
        templateDesign: 'luxury_card',
        colorTheme: 'gold-noir',
        isActive: true,
        order: 1
      },
      {
        title: 'MIDNIGHT FLASH DROP • 40% OFF ON ALL 3-PIECE SETS',
        subtitle: 'Use Code: LUXE40 at checkout • Cash On Delivery Available',
        badgeText: 'LIMITED DROP',
        discountOffer: '40% OFF',
        endDate: tomorrow,
        link: '/category/sets',
        buttonText: 'Shop Flash Sale',
        type: 'flash_sale',
        templateDesign: 'sticky_bar',
        colorTheme: 'gold-noir',
        isActive: true,
        order: 2
      },
      {
        title: 'Weekend Secret Flash Sale',
        subtitle: 'Extra 15% OFF on Premium Handbags & Footwear',
        badgeText: 'EXCLUSIVE 24H',
        discountOffer: 'EXTRA 15% OFF',
        originalPrice: 'PKR 6,450',
        salePrice: 'PKR 5,450',
        endDate: tomorrow,
        link: '/category/handbags',
        buttonText: 'Unlock Deal',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
        type: 'flash_sale',
        templateDesign: 'glass_floating',
        colorTheme: 'rose-gold',
        isActive: true,
        order: 3
      },
      {
        title: '🔥 FLASH SALE: 30% OFF ATELIER TOTES • FREE SAME-DAY DISPATCH • USE CODE: PURSE30',
        subtitle: 'Orders before 5 PM dispatched today across Pakistan',
        badgeText: 'FLASH TICKER',
        discountOffer: '30% OFF',
        endDate: tomorrow,
        link: '/category/all',
        buttonText: 'Shop Now',
        type: 'top_bar',
        templateDesign: 'ticker_bar',
        colorTheme: 'gold-noir',
        isActive: true,
        order: 0
      }
    ];

    for (const b of flashBanners) {
      const exists = await Banner.findOne({ title: b.title });
      if (!exists) {
        await Banner.create(b);
      }
    }
    console.log('✅ Seeded/Verified Flash Sale & Timer Ad Templates');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Hero & Banners:', error);
    process.exit(1);
  }
};

seedData();
