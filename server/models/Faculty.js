// server/models/Faculty.js
import mongoose from 'mongoose';

if (mongoose.models.Faculty) {
  delete mongoose.models.Faculty;
}

const facultySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  facultyId: {
    type: String,
    required: [true, 'Faculty ID is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['core', 'aiml', 'cyber', 'aids'],
      message: 'Invalid department'
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Add index for faster queries
facultySchema.index({ email: 1, facultyId: 1 });

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;