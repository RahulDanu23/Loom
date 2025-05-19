import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import auth from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

// Register student
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollno, section, semester, department } = req.body;

    // Input validation
    if (!name || !email || !password || !rollno || !section || !semester || !department) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if student already exists
    let student = await Student.findOne({ $or: [{ email }, { rollno }] });
    if (student) {
      return res.status(400).json({ 
        success: false,
        message: student.email === email ? 'Email already in use' : 'Roll number already in use' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    student = new Student({
      name,
      email,
      password: hashedPassword,
      rollno,
      section,
      semester: Number(semester),
      department
    });

    // Save student to database
    await student.save();

    // Create JWT token
    const payload = {
      user: {
        id: student.id,
        role: 'student'
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
            id: student.id,
            name: student.name,
            email: student.email,
            role: 'student'
          }
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

// Student login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: student.id,
        role: 'student'
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            role: 'student'
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current student
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;