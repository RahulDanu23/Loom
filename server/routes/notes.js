// Server/routes/notes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Notes = require('../models/Notes');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
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
    const { department, semester, departmentType, subject, topic, facultyId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const newNote = new Notes({
      department,
      semester,
      departmentType,
      subject,
      topic,
      facultyId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
    
    await newNote.save();
    
    res.status(201).json({ 
      message: 'Note uploaded successfully',
      note: newNote
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload note' });
  }
});

// Get notes by faculty ID
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
    const { department, semester, departmentType } = req.query;
    const filter = {};
    
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (departmentType) filter.departmentType = departmentType;
    
    const notes = await Notes.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Download note
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.download(note.filePath, note.fileName);
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
    if (fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath);
    }
    
    // Delete note from database
    await Notes.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;