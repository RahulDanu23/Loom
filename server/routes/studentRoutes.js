import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import { auth, isLoggedIn, restrictTo } from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

// Register student
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { name, email, password, universityRollNo, classRollNo, section, semester, department } = req.body;

    // Input validation
    if (!name || !email || !password || !universityRollNo || !classRollNo || !section || !semester || !department) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }


    // Check if email already exists (case-insensitive)
    let existingStudent = await Student.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Check if university roll number already exists
    existingStudent = await Student.findOne({ universityRollNo: universityRollNo.trim() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'University roll number already in use'
      });
    }

    // Create new student with normalized email (no manual password hashing)
    const student = new Student({
      name: name.trim(),
      email: normalizedEmail,
      password: password, // Let the model's pre-save middleware handle hashing
      universityRollNo: universityRollNo.trim(),
      classRollNo: classRollNo.trim(),
      section: section.trim(),
      semester: Number(semester),
      department: department.toLowerCase().trim()
    });

    // Save student to database
    await student.save();
    console.log('Student registered successfully:', { id: student._id, email: student.email });

    // Create JWT token
    const payload = {
      user: {
        id: student.id,
        role: 'student'
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = error.message.includes('email') ? 'Email' : 'University Roll Number';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    console.log('Searching for student with email:', email);
    // Find user by email with case-insensitive search
    const student = await Student.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password');
    
    console.log('Student found:', student ? 'Yes' : 'No');
    if (student) {
      console.log('Student ID:', student._id);
      console.log('Password exists:', !!student.password);
      console.log('Password length:', student.password ? student.password.length : 0);
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        field: 'email'
      });
    }

    // Check if account is locked
    if (student.loginAttempts >= 5 && student.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((student.lockUntil - Date.now()) / 1000 / 60);
      console.log('Account locked. Remaining time:', remainingTime, 'minutes');
      return res.status(403).json({
        success: false,
        message: `Account locked. Try again in ${remainingTime} minutes.`,
        field: 'password'
      });
    }

    console.log('Attempting password verification');
    // Check password using the model's method
    const isMatch = await student.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      // Increment login attempts
      const updates = { $inc: { loginAttempts: 1 } };
      
      // Lock account after 5 failed attempts for 15 minutes
      if (student.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 minutes
      }
      
      await Student.findByIdAndUpdate(student._id, updates);
      
      const attemptsLeft = 5 - (student.loginAttempts + 1);
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left' : 'Account locked for 15 minutes'}`,
        field: 'password',
        attemptsLeft: attemptsLeft > 0 ? attemptsLeft : 0
      });
    }

    // Reset login attempts on successful login
    if (student.loginAttempts > 0 || student.lockUntil) {
      await Student.findByIdAndUpdate(student._id, {
        $set: { loginAttempts: 0, lockUntil: null }
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: student.id,
        role: 'student',
        email: student.email
      }
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
      path: '/'
    });

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: student._id,
      name: student.name,
      email: student.email,
      role: 'student',
      universityRollNo: student.universityRollNo,
      section: student.section,
      semester: student.semester,
      department: student.department
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current student
router.get('/me', (req, res, next) => {
  auth(req, res, async () => {
    try {
      const student = await Student.findById(req.user._id).select('-password -loginAttempts -lockUntil');
      
      if (!student) {
        return res.status(404).json({ 
          success: false,
          message: 'Student not found' 
        });
      }
      
      res.json({ 
        success: true,
        data: student 
      });
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  });
});

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    res.json({ 
      success: true, 
      user: student 
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Verify token validity
router.get('/verify-token', auth, (req, res) => {
  // If auth middleware passes, the token is valid
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: 'student'
    }
  });
});

export default router;