import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  departmentType: {
    type: String,
    required: [true, 'Department type is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
notesSchema.index({ department: 1, semester: 1, subject: 1 });
notesSchema.index({ facultyId: 1 });

const Notes = mongoose.models.Notes || mongoose.model('Notes', notesSchema);

export default Notes;
