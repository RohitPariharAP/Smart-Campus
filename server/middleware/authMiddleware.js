const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  let token;
  
  // Token retrieval remains the same
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      error: 'Not authorized - No token found',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token first
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with password field explicitly included
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({ 
        error: 'User belonging to this token no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check password change timestamp
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        error: 'Password changed - Please log in again',
        code: 'PASSWORD_CHANGED'
      });
    }

    // Remove password from user object
    user.password = undefined;

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Error handling remains the same
    let message = 'Invalid token';
    let code = 'INVALID_TOKEN';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token expired - Please log in again';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token - Malformed JWT';
      code = 'MALFORMED_TOKEN';
    }

    console.error(`JWT Error: ${error.message}`);
    res.status(401).json({ 
      error: message,
      code: code
    });
  }
};

// teacherOnly middleware remains the same
const teacherOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      error: 'Access restricted to teachers only',
      code: 'TEACHER_ONLY'
    });
  }

  next();
};

module.exports = { protect, teacherOnly };