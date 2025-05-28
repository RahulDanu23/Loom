import express from 'express';
import { auth } from '../middleware/auth.js';
import Note from '../models/Note.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fix the path issue by using path.resolve instead of path.join
    const uploadsDir = path.resolve('./uploads');
    console.log('Uploads directory path:', uploadsDir);
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only PDF, DOC, DOCX, PPT, PPTX are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload a new note
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { department, semester, departmentType, subject, topic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    if (!department || !semester || !departmentType || !subject || !topic) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }
    
    const newNote = new Note({
      department,
      semester: Number(semester),
      departmentType,
      subject,
      topic,
      title: topic,
      description: `${subject} - ${topic}`,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      uploadedBy: req.user._id
    });
    
    await newNote.save();
    
    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      note: newNote
    });
  } catch (err) {
    console.error('Error uploading note:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload note',
      error: err.message
    });
  }
});

// GET /api/notes - Get all notes for logged in faculty
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true,
      notes 
    });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notes' 
    });
  }
});

// Get notes for students (filtered by department, semester, etc.)
router.get('/student', async (req, res) => {
  try {
    const { department, semester, subject } = req.query;
    
    console.log('Notes request received with filters:', { department, semester, subject });
    
    // Build filter object
    const filter = {};
    
    // Department and semester are required
    if (!department || !semester) {
      return res.status(400).json({ 
        success: false,
        message: 'Department and semester filters are required',
        notes: []
      });
    }
    
    // Map department to departmentType if needed
    filter.department = department;
    filter.departmentType = department;
    
    filter.semester = Number(semester);
    
    // Subject is optional - only add to filter if provided
    if (subject && subject.trim() !== '') {
      filter.subject = subject;
    }
    
    console.log('Searching for notes with filter:', filter);
    
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${notes.length} notes matching the criteria`);
    
    res.status(200).json({ 
      success: true,
      notes,
      message: `Found ${notes.length} notes matching the criteria`
    });
  } catch (err) {
    console.error('Error in /notes/student endpoint:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notes', 
      notes: [],
      error: err.message
    });
  }
});

// Get a specific note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      note 
    });
  } catch (err) {
    console.error('Error fetching note:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch note' 
    });
  }
});

// Download note
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }
    
    // Use path.resolve to ensure consistent path handling
    const filePath = path.resolve(`.${note.fileUrl}`);
    console.log('Download file path:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(filePath, note.fileName);
  } catch (err) {
    console.error('Error downloading note:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to download note',
      error: err.message
    });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }
    
    // Check if user is the owner of the note
    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to delete this note' 
      });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), note.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete note from database
    await Note.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Note deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete note' 
    });
  }
});

export default router;
