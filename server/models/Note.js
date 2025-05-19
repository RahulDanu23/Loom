import mongoose from 'mongoose';

// Check if model exists
if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

const noteSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  departmentType: {
    type: String,
    required: true,
    enum: ['core', 'aiml', 'cyber', 'aids']
  },
  semester: {
    type: Number,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileContent: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, { 
  timestamps: true 
});

const Note = mongoose.model('Note', noteSchema);

export default Note;