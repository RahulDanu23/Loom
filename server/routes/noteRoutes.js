import express from 'express';
import { uploadNote, getFacultyNotes, getNoteById, deleteNote } from '../controller/noteController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import Note from '../models/Note.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/notes - Upload a new note
router.post('/', uploadNote);

// GET /api/notes - Get all notes for logged in faculty
router.get('/', getFacultyNotes);

// GET /api/notes/:id - Get a specific note by ID
router.get('/:id', getNoteById);

// DELETE /api/notes/:id - Delete a note by ID
router.delete('/:id', deleteNote);

// Get notes with filters
router.get('/filters', async (req, res) => {
  try {
    const { department, semester, subject, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (department) filter.departmentType = department;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;
    if (search) {
      filter.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(filter)
      .sort({ uploadDate: -1 })
      .populate('uploadedBy', 'name');

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'name');
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
