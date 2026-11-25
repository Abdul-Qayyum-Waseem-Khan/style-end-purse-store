const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('role isVerified name email');
    if (user) {
      req.user = { 
        id: user._id.toString(), 
        userId: user._id.toString(), 
        role: user.role || 'user', 
        isVerified: user.isVerified,
        email: user.email,
        name: user.name 
      };
    }
  } catch (error) {
    // Ignore invalid tokens, proceed as anonymous
  }
  
  next();
};

module.exports = { optionalAuth };
