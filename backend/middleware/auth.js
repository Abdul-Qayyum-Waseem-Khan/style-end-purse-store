const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Authentication Invalid' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch live user from database to always ensure fresh role and permissions
    const user = await User.findById(payload.userId).select('role isVerified name email');
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    req.user = { 
      id: user._id.toString(), 
      userId: user._id.toString(), 
      role: user.role || 'user', 
      isVerified: user.isVerified,
      email: user.email,
      name: user.name 
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication Invalid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized to access this route' });
    }
    next();
  };
};

const authorizeAdmin = authorize('admin');

module.exports = {
  authenticateUser: protect,
  protect,
  authorize,
  authorizeAdmin,
};
