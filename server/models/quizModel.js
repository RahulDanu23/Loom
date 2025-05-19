import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options) {
        return options.length === 4; // Ensuring 4 options (A, B, C, D)
      },
      message: 'Quiz questions must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  }
});

const quizSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  departmentType: {
    type: String,
    required: true,
    enum: ['core', 'aiml', 'cyber', 'aids']
  },
  subject: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,  // Time limit in minutes
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const QuizModel = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
export default QuizModel;
