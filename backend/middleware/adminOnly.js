const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to access this route' });
  }
  next();
};

module.exports = {
  authorizeAdmin,
};
