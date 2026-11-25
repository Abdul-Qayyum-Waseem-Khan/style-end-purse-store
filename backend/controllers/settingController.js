const Setting = require('../models/Setting');

// @desc    Get all public settings
// @route   GET /api/v1/settings
// @access  Public
exports.getSettings = async (req, res) => {
  const settingsArray = await Setting.find({});
  
  // Convert array of {key, value} documents to a single object: { instagram_handle: "...", instagram_posts: [...] }
  const settings = {};
  settingsArray.forEach(s => {
    settings[s.key] = s.value;
  });

  res.status(200).json({
    success: true,
    data: settings
  });
};

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  const updates = req.body; // Expects an object like { instagram_handle: "@...", instagram_posts: [...] }

  for (const [key, value] of Object.entries(updates)) {
    // Find setting by key and update, or create if it doesn't exist
    await Setting.findOneAndUpdate(
      { key },
      { value, group: 'store' }, // Default group to store for now
      { new: true, upsert: true }
    );
  }

  // Fetch updated settings to return
  const settingsArray = await Setting.find({});
  const settings = {};
  settingsArray.forEach(s => {
    settings[s.key] = s.value;
  });

  res.status(200).json({
    success: true,
    data: settings
  });
};
