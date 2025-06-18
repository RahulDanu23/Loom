import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [departmentTypes, setDepartmentTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    department: '',
    semester: '',
    departmentType: '',
    subject: '',
    topic: '',
    file: null
  });

  // Initialize with data 
  useEffect(() => {
    setDepartments([{ id: 'btech', name: 'B.Tech' }]);
    
    setSemesters([
      { id: '1', name: '1st Semester' },
      { id: '2', name: '2nd Semester' },
      { id: '3', name: '3rd Semester' },
      { id: '4', name: '4th Semester' },
      { id: '5', name: '5th Semester' },
      { id: '6', name: '6th Semester' },
      { id: '7', name: '7th Semester' },
      { id: '8', name: '8th Semester' }
    ]);
    
    setDepartmentTypes([
      { id: 'core', name: 'Core' },
      { id: 'aiml', name: 'AI-ML' },
      { id: 'cyber', name: 'Cyber Security' },
      { id: 'aids', name: 'AI-DS' }
    ]);
    
    setSubjects([
      // Core subjects
      { id: 'micro', name: 'Microprocessor', type: 'core' },
      { id: 'daa', name: 'Design Analysis and Algorithms(DAA)', type: 'core' },
      { id: 'java', name: 'Java Programming', type: 'core' },
      { id: 'fa', name: 'Finite Automata', type: 'core' },
      { id: 'cs', name: 'Career Skills', type: 'core' },
      
      // AI-ML subjects
      { id: 'dl', name: 'Deep Learning', type: 'aiml' },
      { id: 'daa-aiml', name: 'Design Analysis and Algorithms(DAA)', type: 'aiml' },
      { id: 'ml', name: 'Machine Learning', type: 'aiml' },
      { id: 'nn', name: 'Neural Networks', type: 'aiml' },
      
      // Cyber Security subjects
      { id: 'daa-cyber', name: 'Design Analysis and Algorithms(DAA)', type: 'cyber' },
      { id: 'ns', name: 'Network Security', type: 'cyber' },
      { id: 'crypto', name: 'Cryptography', type: 'cyber' },
      
      // AI-DS subjects
      { id: 'dm', name: 'Data Mining', type: 'aids' },
      { id: 'daa-aids', name: 'Design Analysis and Algorithms(DAA)', type: 'aids' },
      { id: 'sa', name: 'Statistical Analysis', type: 'aids' }
    ]);
  }, []);
  
  // Load faculty notes on component mount and whenever notes should be refreshed
  useEffect(() => {
    loadFacultyNotes();
  }, []);
  
  // Load faculty profile when profile tab is active
  useEffect(() => {
    if (activeTab === 'profile') {
      loadFacultyProfile();
    }
  }, [activeTab]);
  
  // Fetch feedback for faculty when feedback tab is active
  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab]);
  
  // Function to load faculty profile from the server
  const loadFacultyProfile = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      if (!token) {
        console.log('No faculty token found, redirecting to login');
        navigate('/faculty-login');
        return;
      }
      
      setProfileLoading(true);
      console.log('Loading faculty profile from server...');
      const response = await axios.get('http://localhost:5000/api/faculty/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Faculty profile response:', response.data);
      
      if (response.data && response.data.success) {
        setFacultyProfile(response.data.data);
        console.log('Successfully loaded faculty profile');
      } else {
        console.warn('No profile data found or invalid response format');
        setFacultyProfile(null);
      }
    } catch (error) {
      console.error('Error loading faculty profile:', error);
      if (error.response?.status === 401) {
        // Token might be expired
        localStorage.removeItem('facultyToken');
        console.log('Session expired, redirecting to login');
        navigate('/faculty-login');
      } else {
        // Log the error and show an alert to the user
        console.log('Profile loading error:', error.message);
        alert('Error loading profile. Please try again.');
        setFacultyProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Function to load faculty notes from the server
  const loadFacultyNotes = async () => {
    try {
      const token = localStorage.getItem('facultyToken');
      if (!token) {
        console.log('No faculty token found, redirecting to login');
        navigate('/faculty-login');
        return;
      }
      
      console.log('Loading faculty notes from server...');
      const response = await axios.get('http://localhost:5000/api/notes/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Add timestamp to prevent caching
        params: {
          timestamp: new Date().getTime()
        }
      });
      
      console.log('Faculty notes response:', response.data);
      
      if (response.data && (response.data.notes || Array.isArray(response.data))) {
        // Handle different response formats
        const notesData = response.data.notes || response.data;
        setNotes(notesData);
        console.log(`Successfully loaded ${notesData.length} faculty notes`);
      } else {
        console.warn('No notes found or invalid response format');
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading faculty notes:', error);
      if (error.response?.status === 401) {
        // Token might be expired
        localStorage.removeItem('facultyToken');
        console.log('Session expired, redirecting to login');
        navigate('/faculty-login');
      } else {
        // Log the error and show an alert to the user
        console.log('Note loading error:', error.message);
        alert('Error loading notes. Please try the reload button below.');
        setNotes([]);
      }
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const token = localStorage.getItem('facultyToken');
      const res = await axios.get('http://localhost:5000/api/feedback/faculty', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error('Error loading feedback:', err);
      setFeedback([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Filter subjects based on department type
  useEffect(() => {
    if (formData.departmentType) {
      const filtered = subjects.filter(subject => subject.type === formData.departmentType);
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.departmentType, subjects]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDepartment = (department) => {
    const departmentMap = {
      'core': 'Core',
      'aiml': 'AI-ML',
      'cyber': 'Cyber Security',
      'aids': 'AI-DS'
    };
    return departmentMap[department] || department;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.departmentType || !formData.semester || !formData.subject || !formData.topic || !formData.file) {
        alert('Please fill in all fields and select a file');
        return;
      }
      
      // Create form data for file upload
      const noteData = new FormData();
      noteData.append('department', formData.departmentType); // Use departmentType as department
      noteData.append('departmentType', formData.departmentType);
      noteData.append('semester', formData.semester);
      noteData.append('subject', formData.subject);
      noteData.append('topic', formData.topic);
      noteData.append('file', formData.file);
      
      // Get faculty token
      const token = localStorage.getItem('facultyToken');
      if (!token) {
        alert('You must be logged in to upload notes');
        navigate('/faculty-login');
        return;
      }
      
      // Upload to server
      const response = await axios.post('http://localhost:5000/api/notes/upload', noteData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Note upload response:', response.data);
      
      if (response.data.success || response.status === 201) {
        // Add the new note to the local state
        const newNote = response.data.note || {
          id: Date.now(),
          departmentType: formData.departmentType,
          department: formData.departmentType,
          semester: formData.semester,
          subject: formData.subject,
          topic: formData.topic,
          fileName: formData.file.name,
          fileSize: formData.file.size,
          uploadDate: new Date().toISOString(),
          fileType: formData.file.type
        };
        
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        
        // Reset form
        setFormData({
          department: '',
          semester: '',
          departmentType: '',
          subject: '',
          topic: '',
          file: null
        });
        
        // Reset file input
        document.getElementById('file').value = '';
        
        alert('Notes uploaded successfully to server!');
      } else {
        throw new Error('Server responded but the upload may have failed');
      }
    } catch (error) {
      console.error('Error uploading note to server:', error);
      // Log specific AxiosError details for better debugging
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        alert(`Error uploading note: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Error: No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert(`Error uploading note: ${error.message}`);
      }
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete note with ID:', noteId);
      
      // First, find the full note object to get the correct MongoDB _id
      const noteToDelete = notes.find(note => {
        console.log('Comparing:', note.id, note._id, 'with', noteId);
        return note.id === noteId || note._id === noteId;
      });
      
      if (!noteToDelete) {
        console.error('Note not found in current state:', noteId);
        alert('Could not find the note to delete. Please refresh the page and try again.');
        return;
      }
      
      // Use MongoDB _id for the API call if available
      const idForApi = noteToDelete._id || noteId;
      console.log('Using ID for API call:', idForApi);
      
      const token = localStorage.getItem('facultyToken');
      if (!token) {
        alert('You must be logged in to delete notes');
        navigate('/faculty-login');
        return;
      }
      
      // Make API call to delete the note from the server
      const response = await axios.delete(`http://localhost:5000/api/notes/${idForApi}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Note deletion response:', response.data);
      
      if (response.status === 200) {
        // Update local state before refreshing from server
        const updatedNotes = notes.filter(note => {
          return (note.id !== noteId && note._id !== noteId && note._id !== idForApi);
        });
        setNotes(updatedNotes);
        alert('Note deleted successfully!');
        
        // Refresh the notes list from server to ensure synchronization
        setTimeout(() => {
          loadFacultyNotes();
        }, 500); // Small delay to ensure server has completed the deletion
      } else {
        throw new Error('Failed to delete note on server');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Provide detailed error feedback
      if (error.response) {
        console.error('Server Response:', error.response.data);
        console.error('Status Code:', error.response.status);
        alert(`Error deleting note: ${error.response.data?.message || error.response.statusText || 'Unknown server error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Error: No response received from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert(`Error deleting note: ${error.message}`);
      }
      
      // Refresh notes from server anyway to ensure UI is in sync
      setTimeout(() => {
        loadFacultyNotes();
      }, 1000);
    }
  };

  const viewNote = (noteId) => {
    const fileContent = localStorage.getItem(`note_file_${noteId}`);
    if (!fileContent) {
      alert('File content not found');
      return;
    }
    window.open(fileContent, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyData');
    navigate('/faculty-login');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-500 to-purple-600 text-white flex flex-col">
        <div className="p-6 flex items-center justify-center border-b border-blue-400/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h1 className="text-xl font-bold">Faculty Portal</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${activeTab === 'upload' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Notes</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${activeTab === 'quiz' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quiz</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('performance')}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${activeTab === 'performance' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Performance</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('feedback')}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${activeTab === 'feedback' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Student Feedback</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center p-3 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 border border-white/20 rounded-md hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'upload' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Upload Notes</h2>
            
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-blue-500 mb-2">Department</label>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>            
                <div className="mb-5">
                  <label className="block text-blue-500 mb-2">Semester</label>
                  <select 
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select Semester</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-5">
                  <label className="block text-blue-500 mb-2">Department Type</label>
                  <select 
                    name="departmentType"
                    value={formData.departmentType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Select Department Type</option>
                    {departmentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-5">
                  <label className="block text-blue-500 mb-2">Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={filteredSubjects.length === 0}
                  >
                    <option value="" disabled>Select Subject</option>
                    {filteredSubjects.map(subject => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-5">
                  <label className="block text-blue-500 mb-2">Topic</label>
                  <input 
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="Enter topic name"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-blue-500 mb-2">Upload File</label>
                  <input 
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, PPT, PPTX</p>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Notes
                </button>
              </form>
            </div>
            
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Uploaded Notes</h3>
                <button 
                  onClick={loadFacultyNotes}
                  className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reload Notes
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No notes uploaded yet</p>
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{note.subject}</h4>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                            Semester {note.semester}
                          </span>
                        </div>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {formatDepartment(note.departmentType)}
                        </span>
                      </div>
                      <h5 className="text-gray-700 mb-2">{note.topic}</h5>
                      <div className="text-sm text-gray-500 space-y-1 mb-3">
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {note.fileName}
                        </p>
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {note.uploadDate ? formatDate(note.uploadDate) : 'No date available'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewNote(note.id)}
                          className="flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'quiz' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Generate Quiz</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <p className="text-center text-gray-500">Quiz generation functionality will be implemented here.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Performance Statistics</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <p className="text-center text-gray-500">Performance statistics will be displayed here.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'feedback' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Student Feedback</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {feedbackLoading ? (
                <p className="text-center text-gray-500">Loading feedback...</p>
              ) : feedback.length === 0 ? (
                <p className="text-center text-gray-500">No feedback submitted yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {feedback.map(fb => (
                    <li key={fb._id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-blue-700">{fb.student?.name || 'Unknown Student'}</span>
                          <span className="ml-2 text-xs text-gray-500">{fb.student?.email}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-gray-800">{fb.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Faculty Profile</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {profileLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading profile information...</p>
                </div>
              ) : facultyProfile ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="text-center border-b border-gray-200 pb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{facultyProfile.fullName}</h3>
                    <p className="text-gray-600">{facultyProfile.email}</p>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Faculty ID</label>
                        <p className="text-gray-800 font-medium">{facultyProfile.facultyId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {formatDepartment(facultyProfile.department)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          facultyProfile.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {facultyProfile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
                        <p className="text-gray-800">{formatDate(facultyProfile.lastLogin)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                        <p className="text-gray-800">{formatDate(facultyProfile.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Account ID</label>
                        <p className="text-gray-800 font-mono text-sm">{facultyProfile.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={loadFacultyProfile}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Profile
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-gray-500 mb-4">Failed to load profile information</p>
                  <button 
                    onClick={loadFacultyProfile}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;