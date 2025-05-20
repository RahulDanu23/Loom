// server/routes/facultyRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Faculty from '../models/Faculty.js';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';

const router = express.Router();

// Input validation middleware
const validateRegistration = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('facultyId').notEmpty().withMessage('Faculty ID is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department')
    .isIn(['core', 'aiml', 'cyber', 'aids'])
    .withMessage('Invalid department')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

// Register Faculty
router.post('/register', validateRegistration, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { fullName, email, facultyId, password, department } = req.body;

    // Check if faculty exists
    let faculty = await Faculty.findOne({ $or: [{ email }, { facultyId }] });
    if (faculty) {
      return res.status(400).json({ 
        success: false,
        message: faculty.email === email ? 'Email already in use' : 'Faculty ID already in use' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create faculty
    faculty = new Faculty({
      fullName,
      email,
      facultyId,
      password: hashedPassword,
      department
    });

    // Save to database
    await faculty.save();

    // Create JWT token
    const payload = {
      user: {
        id: faculty.id,
        role: 'faculty'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          success: true,
          token,
          user: {
            id: faculty.id,
            fullName: faculty.fullName,
            email: faculty.email,
            facultyId: faculty.facultyId,
            department: faculty.department,
            role: 'faculty'
          },
          message: 'Registration successful'
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// Login Faculty
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // Check if faculty exists
    const faculty = await Faculty.findOne({ email }).select('+password');
    if (!faculty) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if faculty is active
    if (!faculty.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Check password
    const isMatch = await faculty.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    faculty.lastLogin = new Date();
    await faculty.save({ validateBeforeSave: false });

    // Create JWT token
    const payload = {
      user: {
        id: faculty.id,
        role: 'faculty'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true,
          token,
          user: {
            id: faculty.id,
            fullName: faculty.fullName,
            email: faculty.email,
            facultyId: faculty.facultyId,
            department: faculty.department,
            role: 'faculty'
          },
          message: 'Login successful'
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Get faculty profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const faculty = await Faculty.findById(decoded.user.id);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: faculty.id,
        fullName: faculty.fullName,
        email: faculty.email,
        facultyId: faculty.facultyId,
        department: faculty.department,
        lastLogin: faculty.lastLogin,
        isActive: faculty.isActive,
        createdAt: faculty.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;