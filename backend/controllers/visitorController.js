const Visitor = require('../models/Visitor');
const crypto = require('crypto');

// @desc    Track visitor details
// @route   POST /api/v1/visitors/track
// @access  Public (Optional Auth)
const trackVisitor = async (req, res) => {
  try {
    let {
      visitorId,
      browser,
      os,
      device,
      language,
      timezone,
      landingPage,
      referrer,
      utmParameters
    } = req.body;

    const userId = req.user?.id || null;
    let visitor;

    if (visitorId) {
      visitor = await Visitor.findOne({ visitorId });
    }

    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = new Date();
      if (userId && !visitor.user) {
        visitor.user = userId; // Link to user if they just logged in
      }
      
      // Update fields if provided
      if (browser) visitor.browser = browser;
      if (os) visitor.os = os;
      if (device) visitor.device = device;
      if (language) visitor.language = language;
      if (timezone) visitor.timezone = timezone;
      
      // Only update landing page/referrer/UTMs if they aren't already set, 
      // or if we have a new campaign. Keeping it simple here and overwriting for latest session tracking.
      if (landingPage) visitor.landingPage = landingPage;
      if (referrer) visitor.referrer = referrer;
      if (utmParameters && Object.keys(utmParameters).length > 0) {
        visitor.utmParameters = { ...visitor.utmParameters, ...utmParameters };
      }

      await visitor.save();
    } else {
      // Create new visitor
      visitorId = visitorId || crypto.randomUUID();
      visitor = await Visitor.create({
        visitorId,
        user: userId,
        browser,
        os,
        device,
        language,
        timezone,
        landingPage,
        referrer,
        utmParameters,
        firstVisit: new Date(),
        lastVisit: new Date()
      });
    }

    res.status(200).json({ success: true, data: { visitorId: visitor.visitorId } });
  } catch (error) {
    console.error('Visitor Tracking Error:', error);
    res.status(500).json({ success: false, error: 'Server Error tracking visitor' });
  }
};

module.exports = {
  trackVisitor
};
