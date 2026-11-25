const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    device: { type: String, default: 'Desktop' },
    language: { type: String, default: 'en-US' },
    timezone: { type: String, default: 'UTC' },
    landingPage: { type: String },
    referrer: { type: String },
    utmParameters: {
      source: { type: String, default: null },
      medium: { type: String, default: null },
      campaign: { type: String, default: null },
      content: { type: String, default: null },
      term: { type: String, default: null },
    },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
