const mongoose = require('mongoose');
const slugify = require('slugify');

const PageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a page title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug (e.g. about, contact)'],
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide page content'],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', PageSchema);
