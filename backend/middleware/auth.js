/**
 * AUTH MIDDLEWARE
 * Verifies JWT tokens and protects private routes.
 * Also handles role-based access control.
 */

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// ── Verify JWT Token ──────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request based on role
    if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id);
    } else {
      req.user = await Student.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.',
      });
    }

    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ── Admin Only Middleware ─────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Admin privileges required.',
    });
  }
  next();
};

// ── Student Only Middleware ───────────────────────────────────────────────
const studentOnly = (req, res, next) => {
  if (req.userRole !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Student access only.',
    });
  }
  next();
};

module.exports = { protect, adminOnly, studentOnly };
