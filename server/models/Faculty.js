// server/models/Faculty.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
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

// Add indexes for faster queries
facultySchema.index({ email: 1 });
facultySchema.index({ facultyId: 1 });

// Add method to check if password matches
facultySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Faculty', facultySchema);