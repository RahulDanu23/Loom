import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
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
  topic: {
    type: String,
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
    type: String,  // Base64 encoded file content
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const NoteModel = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default NoteModel;
