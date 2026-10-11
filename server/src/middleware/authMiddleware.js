const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const db = require('../db/db');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or account removed.' });
    }

    if (user.is_frozen) {
      return res.status(403).json({ success: false, message: 'Your account is frozen. Please contact customer support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
  next();
}

module.exports = {
  authenticate,
  isAdmin
};
