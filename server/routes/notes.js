// Server/routes/notes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Notes from '../models/Notes.js';
import { auth } from '../middleware/auth.js'; // Assuming auth middleware is defined in this file
import { binarySearchNotes } from '../utils/binarySearch.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fix the path issue by using path.resolve instead of process.cwd()
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

// Upload notes
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
    
    const newNote = new Notes({
      department,
      semester: Number(semester),
      departmentType,
      subject,
      topic,
      facultyId: req.user._id, // Use facultyId instead of uploadedBy
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size
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

// Get notes by faculty ID
router.get('/faculty', async (req, res) => {
  try {
    console.log('Faculty notes request received from user ID:', req.user._id);
    
    const facultyId = req.user._id;
    let query = { facultyId };
    
    // Add optional filters if provided
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = Number(req.query.semester);
    if (req.query.subject) query.subject = req.query.subject;
    
    console.log('Searching for faculty notes with query:', query);
    
    // Sort by newest first
    const notes = await Notes.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${notes.length} notes for faculty ID ${facultyId}`);
    
    // Return a consistent response format
    res.status(200).json({ 
      success: true,
      notes,
      count: notes.length
    });
  } catch (err) {
    console.error('Error fetching faculty notes:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notes',
      error: err.message
    });
  }
});

router.get('/faculty/:facultyId', async (req, res) => {
  try {
    const notes = await Notes.find({ facultyId: req.params.facultyId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Get notes for students (filtered by department, semester, etc.)
router.get('/student', async (req, res) => {
  try {
    const { department, semester, subject } = req.query;
    
    console.log('Notes request received with filters:', { department, semester, subject });
    
    // Require all three filters to be present
    if (!department || !semester || !subject) {
      return res.status(400).json({ 
        success: false,
        message: 'Department, semester, and subject filters are required',
        notes: []
      });
    }
    
    const filter = {
      department,
      semester,
      subject
    };
    
    console.log('Searching for notes with filter:', filter);
    
    const notes = await Notes.find(filter).sort({ createdAt: -1 });
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

// Get notes by department
router.get('/department/:department', async (req, res) => {
  try {
    // This endpoint is being deprecated in favor of the filtered /student endpoint
    // Return empty array to encourage using the proper filtering
    res.status(200).json({ notes: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notes', notes: [] });
  }
});

// Download note
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Use path.resolve to ensure consistent path handling
    const filePath = path.resolve(`.${note.filePath}`);
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
    console.error(err);
    res.status(500).json({ message: 'Failed to download note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Delete file from filesystem
    const filePath = path.resolve(`.${note.filePath}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete note from database
    await Notes.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

export default router;