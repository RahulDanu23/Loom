import QuizModel from '../models/quizModel.js';

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { department, semester, departmentType, subject, title, questions, timeLimit } = req.body;
    
    // Validate required fields
    if (!department || !semester || !departmentType || !subject || !title || !questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'All fields are required and at least one question must be provided' });
    }
    
    // Validate that each question has the required fields
    for (const question of questions) {
      if (!question.question || !question.options || question.options.length !== 4 || !question.correctAnswer) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each question must have question text, 4 options, and a correct answer' 
        });
      }
    }
    
    // Create new quiz
    const newQuiz = new QuizModel({
      faculty: req.user._id, // Assuming middleware adds authenticated user to req.user
      department,
      semester,
      departmentType,
      subject,
      title,
      questions,
      timeLimit: timeLimit || 30 // Default 30 minutes if not provided
    });
    
    // Save quiz to database
    await newQuiz.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Quiz created successfully',
      quiz: {
        id: newQuiz._id,
        department,
        semester,
        departmentType,
        subject,
        title,
        questionCount: questions.length,
        timeLimit: newQuiz.timeLimit,
        createdAt: newQuiz.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while creating quiz' });
  }
};

// Get all quizzes for a faculty
export const getFacultyQuizzes = async (req, res) => {
  try {
    // Find all quizzes for the authenticated faculty
    const quizzes = await QuizModel.find({ faculty: req.user._id })
      .select('-questions.correctAnswer') // Don't send correct answers in the list
      .sort({ createdAt: -1 });
      
    res.status(200).json({ 
      success: true, 
      count: quizzes.length,
      quizzes
    });
    
  } catch (error) {
    console.error('Error fetching faculty quizzes:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while fetching quizzes' });
  }
};

// Get a specific quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Find the quiz by ID and faculty ID (for security)
    const quiz = await QuizModel.findOne({ _id: quizId, faculty: req.user._id });
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      quiz
    });
    
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while fetching quiz' });
  }
};

// Delete a quiz by ID
export const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Find and delete the quiz (only if it belongs to the authenticated faculty)
    const deletedQuiz = await QuizModel.findOneAndDelete({ _id: quizId, faculty: req.user._id });
    
    if (!deletedQuiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or you do not have permission to delete it' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Quiz deleted successfully',
      deletedQuiz: {
        id: deletedQuiz._id,
        subject: deletedQuiz.subject,
        title: deletedQuiz.title
      }
    });
    
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while deleting quiz' });
  }
};
