import express from 'express';
import Feedback from '../models/Feedback.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Submit feedback
router.post('/', authenticate, async (req, res) => {
  try {
    const { teacher, message } = req.body;

    const feedback = new Feedback({
      student: req.user._id,
      teacher,
      message
    });

    await feedback.save();
    res.json({
      success: true,
      feedback
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get student's feedback history
router.get('/my-feedback', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate('teacher', 'name');

    res.json({
      success: true,
      feedback
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;