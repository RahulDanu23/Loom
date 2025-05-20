import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

const auth = async (req, res, next) => {
  console.log('Auth middleware called');
  try {
    // 1) Get token from header or cookie
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token from header:', token ? 'exists' : 'not found');
    } else if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('Token from cookie:', token ? 'exists' : 'not found');
    }

    // 2) Check if token exists
    if (!token) {
      console.log('No token found');
      return res.status(401).json({ 
        success: false,
        message: 'You are not logged in! Please log in to get access.' 
      });
    }


    // 3) Verify token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // 4) Check if user still exists
    const currentUser = await Student.findById(decoded.user.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 5) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password! Please log in again.'
      });
    }

    // 6) Check if account is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    let message = 'Invalid or expired token. Please log in again.';
    let statusCode = 401;

    if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please log in again.';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Your session has expired. Please log in again.';
    } else if (process.env.NODE_ENV === 'development') {
      message = error.message;
      statusCode = 500;
    }

    // Clear the token cookie if it's invalid
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.status(statusCode).json({
      success: false,
      message
    });
  }
};

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
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
const restrictTo = (...roles) => {
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

export { auth, isLoggedIn, restrictTo };