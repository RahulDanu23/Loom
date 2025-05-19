import express from 'express';
import { createQuiz, getFacultyQuizzes, getQuizById, deleteQuiz } from '../controller/quizController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/quizzes - Create a new quiz
router.post('/', createQuiz);

// GET /api/quizzes - Get all quizzes for logged in faculty
router.get('/', getFacultyQuizzes);

// GET /api/quizzes/:id - Get a specific quiz by ID
router.get('/:id', getQuizById);

// DELETE /api/quizzes/:id - Delete a quiz by ID
router.delete('/:id', deleteQuiz);

// Get available quizzes
router.get('/', async (req, res) => {
  try {
    const { department, semester, subject } = req.query;
    
    // Build filter object
    const filter = {};
    if (department) filter.departmentType = department;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    const quizzes = await Quiz.find(filter)
      .sort({ dueDate: 1 })
      .populate('createdBy', 'name');

    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Don't send correct answers to students
    const quizWithoutAnswers = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options
      }))
    };

    res.json(quizWithoutAnswers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Submit quiz answers
router.post('/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const result = {
      totalQuestions: quiz.questions.length,
      correctAnswers: score,
      percentage: (score / quiz.questions.length) * 100
    };

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
