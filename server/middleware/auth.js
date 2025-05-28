import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

export const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token from header:', token ? 'exists' : 'not found');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token from cookie:', token ? 'exists' : 'not found');
    }

    // 2) Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // 3) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, decoded:', decoded);

    // 4) Check if user exists (could be student or faculty)
    let user;
    
    // Check if the token contains a role or userType field to determine the model
    if (decoded.user && decoded.user.role === 'faculty') {
      user = await Faculty.findById(decoded.user.id);
      console.log('Faculty user found:', user ? 'yes' : 'no');
    } else {
      user = await Student.findById(decoded.user.id);
      console.log('Student user found:', user ? 'yes' : 'no');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // 5) Check if user changed password after token was issued (if applicable)
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password! Please log in again.'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: error.message
    });
  }
};

// Only for rendered pages, no errors!
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.token) {
    try {
      // 1) Verify token
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });

      // 2) Check if user still exists
      const currentUser = await Student.findById(decoded.user.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};