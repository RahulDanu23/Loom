import NoteModel from '../models/noteModel.js';

// Upload a new note
export const uploadNote = async (req, res) => {
  try {
    const { department, semester, departmentType, subject, topic, fileName, fileSize, fileType, fileContent } = req.body;
    
    // Validate required fields
    if (!department || !semester || !departmentType || !subject || !topic || !fileName || !fileContent) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Create new note
    const newNote = new NoteModel({
      faculty: req.user._id, // Assuming middleware adds authenticated user to req.user
      department,
      semester,
      departmentType,
      subject,
      topic,
      fileName,
      fileSize,
      fileType,
      fileContent
    });
    
    // Save note to database
    await newNote.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Note uploaded successfully',
      note: {
        id: newNote._id,
        department,
        semester,
        departmentType,
        subject,
        topic,
        fileName,
        fileSize,
        fileType,
        uploadDate: newNote.uploadDate
      }
    });
    
  } catch (error) {
    console.error('Error uploading note:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while uploading note' });
  }
};

// Get all notes for a faculty
export const getFacultyNotes = async (req, res) => {
  try {
    // Find all notes for the authenticated faculty
    const notes = await NoteModel.find({ faculty: req.user._id })
      .select('-fileContent') // Exclude large file content from response
      .sort({ uploadDate: -1 });
      
    res.status(200).json({ 
      success: true, 
      count: notes.length,
      notes
    });
    
  } catch (error) {
    console.error('Error fetching faculty notes:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while fetching notes' });
  }
};

// Get a specific note by ID
export const getNoteById = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Find the note by ID and faculty ID (for security)
    const note = await NoteModel.findOne({ _id: noteId, faculty: req.user._id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      note
    });
    
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while fetching note' });
  }
};

// Delete a note by ID
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Find and delete the note (only if it belongs to the authenticated faculty)
    const deletedNote = await NoteModel.findOneAndDelete({ _id: noteId, faculty: req.user._id });
    
    if (!deletedNote) {
      return res.status(404).json({ success: false, message: 'Note not found or you do not have permission to delete it' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Note deleted successfully',
      deletedNote: {
        id: deletedNote._id,
        subject: deletedNote.subject,
        topic: deletedNote.topic
      }
    });
    
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, message: 'Server error occurred while deleting note' });
  }
};
