const User = require('../models/User');
const { deleteCloudinaryImage } = require('../utils/cloudinaryUtils');
const { validateEmail } = require('../utils/emailValidator');

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) {
      const formatPhoneNumber = require('../utils/phoneFormatter');
      user.phone = formatPhoneNumber(phone);
    }

    // Email update requires current password
    if (email && email.toLowerCase().trim() !== user.email) {
      const cleanEmail = email.toLowerCase().trim();
      const emailCheck = validateEmail(cleanEmail);
      if (!emailCheck.isValid) {
        return res.status(400).json({ success: false, error: emailCheck.error });
      }

      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change email' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Incorrect current password' });
      }
      user.email = cleanEmail;
    }

    // Password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change password' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Incorrect current password' });
      }
      user.password = newPassword;
    }

    // Avatar upload
    if (req.file) {
      if (user.avatar) {
        await deleteCloudinaryImage(user.avatar);
      }
      user.avatar = req.file.path; // Cloudinary URL
    }

    await user.save();

    // Return updated user (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @route   GET /api/v1/users/addresses
// @desc    Get user addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   POST /api/v1/users/addresses
// @desc    Add new address
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    const formatPhoneNumber = require('../utils/phoneFormatter');
    const newAddress = { ...req.body };
    if (newAddress.phone) {
      newAddress.phone = formatPhoneNumber(newAddress.phone);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   PUT /api/v1/users/addresses/:id
// @desc    Update address
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const { isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    const formatPhoneNumber = require('../utils/phoneFormatter');
    const updatedAddress = { ...req.body };
    if (updatedAddress.phone) {
      updatedAddress.phone = formatPhoneNumber(updatedAddress.phone);
    }

    address.set(updatedAddress);
    await user.save();

    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   DELETE /api/v1/users/addresses/:id
// @desc    Delete address
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull(req.params.id);
    await user.save();

    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   POST /api/v1/users/wishlist/:productId
// @desc    Toggle wishlist item
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.params;

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    
    // Return populated wishlist
    const populatedUser = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: populatedUser.wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route   GET /api/v1/users/wishlist
// @desc    Get user wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
