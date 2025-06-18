import express from 'express';
import Feedback from '../models/Feedback.js';
import { authenticate } from '../middleware/authMiddleware.js';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Submit feedback
router.post('/', authenticate, async (req, res) => {
  try {
    const { teacher, message } = req.body;

    // Find faculty by name
    const faculty = await Faculty.findOne({ fullName: teacher });
    if (!faculty) {
      return res.status(400).json({ success: false, message: 'Teacher not found' });
    }

    const feedback = new Feedback({
      student: req.user._id,
      teacher: faculty._id,
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
      .populate('teacher', 'fullName email');
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

// Get feedback for a faculty (teacher)
router.get('/faculty', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.find({ teacher: req.user._id })
      .sort({ createdAt: -1 })
      .populate('student', 'name email');
    res.json({ success: true, feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete feedback by id (only by student who created it)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    if (feedback.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;