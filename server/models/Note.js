import mongoose from "mongoose";

// Check if model exists
if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['core', 'aiml', 'cyber', 'aids']
  },
  departmentType: {
    type: String,
    required: [true, 'Department type is required'],
    enum: ['core', 'aiml', 'cyber', 'aids']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 10
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster queries
noteSchema.index({ departmentType: 1, semester: 1, subject: 1 });
noteSchema.index({ department: 1, semester: 1, subject: 1 });
noteSchema.index({ uploadedBy: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;