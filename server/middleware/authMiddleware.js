import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Try to find user in both Student and Faculty collections
    let user = await Student.findById(decoded.user.id);
    if (!user) user = await Faculty.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token is invalid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication'
    });
  }
};