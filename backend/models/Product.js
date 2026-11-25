const mongoose = require('mongoose');
const slugify = require('slugify');
const mongoosePaginate = require('mongoose-paginate-v2');

const ColorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Obsidian Black", "Champagne Gold"
  hex: { type: String, default: '#111827' }, // e.g. "#111827"
  image: { type: String }, // Optional dedicated image URL for this color
  stock: { type: Number, default: 10 }
}, { _id: true });

const SetOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Purse Only", "Pouch Only", "Wallet Only", "Complete 3-in-1 Set (Purse + Pouch + Wallet)"
  price: { type: Number, required: true },
  comparePrice: { type: Number, default: null },
  includedItems: { type: [String], default: [] }, // e.g. ["Handbag", "Matching Pouch", "Card Wallet"]
  sku: { type: String },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    productType: {
      type: String,
      enum: ['single', 'bundle', 'set'],
      default: 'single'
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    shortDescription: {
      type: String,
      maxlength: [250, 'Short description can not be more than 250 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    comparePrice: {
      type: Number,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: null,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
    },
    SKU: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Color Swatches & Variants
    colors: {
      type: [ColorVariantSchema],
      default: []
    },
    // Set / Combo Options (e.g. Purse only, Pouch only, 3-in-1 set)
    setOptions: {
      type: [SetOptionSchema],
      default: []
    },
    // Luxury Atelier Specifications
    material: {
      type: String,
      default: 'Premium Italian Calfskin Leather'
    },
    hardware: {
      type: String,
      default: '24K Champagne Gold Plated Hardware'
    },
    lining: {
      type: String,
      default: 'Custom Monogram Silk Satin'
    },
    dimensions: {
      length: { type: String, default: '' },
      width: { type: String, default: '' },
      height: { type: String, default: '' },
      strapDrop: { type: String, default: '' }
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 5.0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    badges: {
      authentic: {
        title: { type: String, default: '100% Authentic' },
        subtitle: { type: String, default: 'Certified Artisan Leather' }
      },
      delivery: {
        title: { type: String, default: 'Express Delivery' },
        subtitle: { type: String, default: 'Cash on Delivery Available' }
      }
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ProductSchema.plugin(mongoosePaginate);

// Virtual for isOnSale
ProductSchema.virtual('isOnSale').get(function() {
  return this.comparePrice ? this.comparePrice > this.price : false;
});

ProductSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Product', ProductSchema);
