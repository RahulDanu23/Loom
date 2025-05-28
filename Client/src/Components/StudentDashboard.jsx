import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSignOutAlt, FaSearch, FaSort } from 'react-icons/fa';
import { filterNotesWithBinarySearch, mergeSortNotes, searchNotesByTopic } from '../services/algorithms';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activeSection, setActiveSection] = useState('notes');
  const [filters, setFilters] = useState({
    department: '',
    semester: '',
    subject: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    teacher: '',
    message: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    section: '',
    semester: ''
  });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios with authentication token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default auth header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Set authorization header with token');
    } else {
      console.error('No token found in localStorage');
      toast.error('Authentication token missing. Please log in again.');
      navigate('/student-login');
    }
  }, [navigate]);

  // Subject lists based on department
  const subjectLists = {
    core: [
      'Microprocessor',
      'Design Analysis and Algorithms(DAA)',
      'Java Programming',
      'Finite Automata',
      'Career Skills'
    ],
    aiml: [
      'Deep Learning',
      'Design Analysis and Algorithms(DAA)',
      'Machine Learning',
      'Neural Networks',
      'Computer Vision',
      'Natural Language Processing'
    ],
    aids: [
      'Data Mining',
      'Design Analysis and Algorithms(DAA)',
      'Statistical Analysis',
      'Big Data Analytics',
      'Predictive Modeling',
      'Data Visualization'
    ],
    cyber: [
      'Design Analysis and Algorithms(DAA)',
      'Network Security',
      'Cryptography',
      'Ethical Hacking',
      'Digital Forensics',
      'Information Security'
    ]
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load student profile first
        const profileRes = await axios.get('http://localhost:5000/api/students/me');
        
        if (!profileRes.data || !profileRes.data.data) {
          throw new Error('Invalid response format from server');
        }
        
        const studentData = profileRes.data.data;
        setStudent(studentData);
        
        // Update profile form with student data
        setProfileForm({
          name: studentData.name || '',
          email: studentData.email || '',
          section: studentData.section || '',
          semester: studentData.semester || ''
        });
        
        // Set initial filters based on student data
        setFilters({
          department: studentData.department || '',
          semester: studentData.semester || '',
          subject: '' // Leave subject empty initially, user must select
        });
        
        // Don't load notes initially - wait for user to select subject and apply filters
        console.log('Initial profile loaded. User must select subject to load notes.');
        
      } catch (err) {
        console.error('Error loading student data:', err);
        
        if (err.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          toast.error('Your session has expired. Please log in again.');
          navigate('/student-login');
        } else {
          toast.error('Failed to load profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const res = await axios.get('/api/students/me');
      setStudent(res.data.data);
      setProfileForm({
        name: res.data.data.name,
        email: res.data.data.email,
        section: res.data.data.section,
        semester: res.data.data.semester
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadNotes = async () => {
    try {
      console.log('Loading notes with filters:', filters);
      
      // Validate that all required filters are present
      if (!filters.department || !filters.semester || !filters.subject) {
        console.warn('Missing required filters:', filters);
        toast.error('Department, semester, and subject are all required to load notes');
        setNotes([]);
        return;
      }
      
      // Use the student endpoint with filters instead of the department endpoint
      const res = await axios.get('http://localhost:5000/api/notes/student', {
        params: {
          department: filters.department,
          semester: filters.semester,
          subject: filters.subject
        }
      });
      
      console.log('Notes API response:', res.data);
      
      if (Array.isArray(res.data.notes)) {
        // Store all notes retrieved from the API
        const fetchedNotes = res.data.notes;
        setAllNotes(fetchedNotes);
        
        // Apply binary search and merge sort to filter and sort the notes
        const filteredAndSortedNotes = filterNotesWithBinarySearch(fetchedNotes, filters);
        console.log(`Successfully loaded and sorted ${filteredAndSortedNotes.length} notes using binary search algorithm`);
        
        setNotes(filteredAndSortedNotes);
      } else {
        console.warn('Notes data is not an array:', res.data);
        setNotes([]);
        setAllNotes([]);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      
      if (err.response?.status === 401) {
        // Instead of immediately logging out, first try to refresh the token or retry
        console.log('Authentication error when loading notes. Attempting to recover...');
        
        // Check if token exists but might be invalid
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token again in case it wasn't properly applied
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Show a warning instead of logging out immediately
          toast.warning('Having trouble loading notes. Please refresh the page if this persists.');
        } else {
          // Only logout if no token exists at all
          toast.error('Your session has expired. Please log in again.');
          navigate('/student-login');
        }
      } else if (err.response?.status === 400) {
        // Invalid filters
        toast.error('Please select valid department, semester, and subject filters');
      } else {
        toast.error('Failed to load notes. Please try again later.');
      }
      
      setNotes([]); // Ensure notes is always an array even if there's an error
      setAllNotes([]);
    }
  };

  const loadQuizzes = async () => {
    try {
      const res = await axios.get('/api/quizzes', { 
        params: filters
      });
      
      setQuizzes(res.data);
    } catch (err) {
      console.error('Error loading quizzes:', err);
      
      if (err.response?.status === 401) {
        // Instead of immediately logging out, first try to refresh the token
        console.log('Authentication error when loading quizzes. Attempting to recover...');
        
        // Check if token exists but might be invalid
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token again in case it wasn't properly applied
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Show a warning instead of logging out immediately
          toast.warning('Having trouble loading quizzes. Please refresh the page if this persists.');
        } else {
          // Only logout if no token exists at all
          toast.error('Your session has expired. Please log in again.');
          navigate('/student-login');
        }
      } else {
        toast.error('Failed to load quizzes. Please try again later.');
      }
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await axios.get('/api/feedback/student');
      
      setFeedback(res.data);
    } catch (err) {
      console.error('Error loading feedback:', err);
      
      if (err.response?.status === 401) {
        // Instead of immediately logging out, first try to refresh the token
        console.log('Authentication error when loading feedback. Attempting to recover...');
        
        // Check if token exists but might be invalid
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token again in case it wasn't properly applied
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Show a warning instead of logging out immediately
          toast.warning('Having trouble loading feedback. Please refresh the page if this persists.');
        } else {
          // Only logout if no token exists at all
          toast.error('Your session has expired. Please log in again.');
          navigate('/student-login');
        }
      } else {
        toast.error('Failed to load feedback. Please try again later.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'department') {
      // Reset subject when department changes
      setFilters(prev => ({
        ...prev,
        [name]: value,
        subject: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const applyFilters = () => {
    if (filters.department && filters.semester && filters.subject) {
      loadNotes();
      loadQuizzes();
      setFiltersApplied(true);
      setSearchTerm(''); // Reset search term when applying new filters
    } else {
      toast.error('Please select department, semester, and subject before applying filters');
    }
  };
  
  // Handle search by topic using binary search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search term is empty, apply the normal filters
      if (allNotes.length > 0) {
        const filteredNotes = filterNotesWithBinarySearch(allNotes, filters);
        setNotes(filteredNotes);
      }
      return;
    }
    
    // Search for notes by topic using the search term
    const searchResults = searchNotesByTopic(allNotes, term);
    setNotes(searchResults);
    console.log(`Found ${searchResults.length} notes matching search term "${term}"`);
  };
  
  // Toggle sort order and sort notes
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    
    // Sort notes by topic based on sort order
    const sortedNotes = [...notes].sort((a, b) => {
      const comparison = a.topic.localeCompare(b.topic);
      return newOrder === 'asc' ? comparison : -comparison;
    });
    
    setNotes(sortedNotes);
    toast.info(`Notes sorted by topic (${newOrder === 'asc' ? 'A-Z' : 'Z-A'})`);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    axios.post('/api/feedback', feedbackForm)
      .then(res => {
        toast.success('Feedback submitted successfully');
        setFeedbackForm({ teacher: '', message: '' });
        loadFeedback();
      })
      .catch(err => {
        console.error('Error submitting feedback:', err);
        toast.error('Failed to submit feedback');
      });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    axios.put('/api/students/profile', profileForm)
      .then(res => {
        toast.success('Profile updated successfully');
        loadProfile();
      })
      .catch(err => {
        console.error('Error updating profile:', err);
        toast.error('Failed to update profile');
      });
  };

  const handleQuizStart = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleQuizSubmit = () => {
    // Simple validation to ensure all questions are answered
    if (Object.keys(quizAnswers).length !== selectedQuiz.questions.length) {
      return toast.error('Please answer all questions');
    }
    
    // TODO: Send answers to backend for evaluation
    setQuizResult({ correctAnswers: 3, totalQuestions: 5, percentage: 60 });
  };

  const downloadNote = (note) => {
    try {
      console.log('Note object for download:', note);
      
      // Check if we have a valid note ID
      if (!note._id && !note.id) {
        toast.error('Cannot download: Note ID is missing');
        return;
      }
      
      const noteId = note._id || note.id;
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/student-login');
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      
      // For download, we'll use axios to handle the authentication
      axios({
        url: `http://localhost:5000/api/notes/download/${noteId}`,
        method: 'GET',
        responseType: 'blob', // Important for handling file downloads
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        // Create a blob URL for the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        link.href = url;
        link.download = note.fileName || note.title || `${note.subject}-${note.topic}.pdf`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast.success('Note downloaded successfully!');
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        toast.error('Failed to download note. Please try again.');
      });
    } catch (error) {
      console.error('Error in download function:', error);
      toast.error('Failed to download note. Please try again.');
    }
  };

  const viewNote = (note) => {
    try {
      console.log('Note object for view:', note);
      
      // Check if we have a valid note ID
      if (!note._id && !note.id) {
        toast.error('Cannot view: Note ID is missing');
        return;
      }
      
      const noteId = note._id || note.id;
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        navigate('/student-login');
        return;
      }
      
      // For viewing, we'll open a new window and set the Authorization header
      const viewWindow = window.open('', '_blank');
      
      if (!viewWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site.');
        return;
      }
      
      viewWindow.document.write('<html><body><h3>Loading note...</h3></body></html>');
      
      // Use axios to get the file with authentication
      axios({
        url: `http://localhost:5000/api/notes/download/${noteId}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        // Create a blob URL for the file
        const fileType = response.headers['content-type'] || 'application/pdf';
        const blob = new Blob([response.data], { type: fileType });
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Redirect the new window to the blob URL
        viewWindow.location.href = blobUrl;
      })
      .catch(error => {
        console.error('Error viewing file:', error);
        viewWindow.document.write(`<html><body><h3>Error loading note: ${error.message}</h3></body></html>`);
        toast.error('Failed to view note. Please try again.');
      });
    } catch (error) {
      console.error('Error in view function:', error);
      toast.error('Failed to view note. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    navigate('/student-login');
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed position with absolute height */}
        <div className="w-64 bg-gradient-to-b from-[#667eea] to-[#764ba2] text-white flex flex-col drop-shadow-xl fixed h-screen">
          <div className="p-6 flex items-center justify-center border-b border-indigo-400/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-xl font-bold">Student Portal</h2>
          </div>
          
          <div className="px-4 mb-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="inline-block p-2 rounded-full bg-white/20 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{student?.name || 'Student'}</h3>
              <p className="text-sm text-white/70">{student?.email || 'student@example.com'}</p>
            </div>
          </div>
          
          <div className="px-4 flex-grow overflow-y-auto">
            <nav className="space-y-2 pb-4">
              <button
                onClick={() => setActiveSection('notes')}
                className={`flex items-center w-full p-3 rounded-md transition-colors ${
                  activeSection === 'notes' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Study Notes</span>
              </button>
              
              <button
                onClick={() => setActiveSection('quizzes')}
                className={`flex items-center w-full p-3 rounded-md transition-colors ${
                  activeSection === 'quizzes' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quizzes</span>
              </button>
              
              <button
                onClick={() => setActiveSection('feedback')}
                className={`flex items-center w-full p-3 rounded-md transition-colors ${
                  activeSection === 'feedback' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Feedback</span>
              </button>
              
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center w-full p-3 rounded-md transition-colors ${
                  activeSection === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>
            </nav>
          </div>
          
          {/* Logout Button at the bottom */}
          {/* Logout button - Always at the bottom */}
          <div className="p-4 border-t border-indigo-400/30 absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#667eea] to-[#764ba2]">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-3 rounded-md hover:bg-white/10 transition-colors group"
            >
              <FaSignOutAlt className="mr-2 group-hover:text-red-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content - With left margin to account for fixed sidebar */}
        <div className="flex-1 p-8 ml-64">

          {/* Notes Section */}
          {activeSection === 'notes' && (
            <div>
              {/* Filters - Only visible in notes section */}
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">DEPARTMENT TYPE</label>
                    <select
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select Department</option>
                      <option value="core">Core</option>
                      <option value="aiml">AI-ML</option>
                      <option value="cyber">Cyber Security</option>
                      <option value="aids">AI-DS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">SEMESTER</label>
                    <select
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">SUBJECT</label>
                    <select
                      name="subject"
                      value={filters.subject}
                      onChange={handleFilterChange}
                      className="w-full border rounded p-2"
                      disabled={!filters.department}
                    >
                      <option value="">Select Subject</option>
                      {filters.department && subjectLists[filters.department]?.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex items-center">
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search by topic..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full border rounded p-2 pl-8"
                      />
                      <FaSearch className="absolute left-2 top-3 text-gray-500" />
                    </div>
                    <button
                      onClick={toggleSortOrder}
                      className="ml-2 bg-gray-200 p-2 rounded hover:bg-gray-300 flex items-center"
                      title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      <FaSort className="mr-1" />
                      {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </button>
                  </div>
                  <button
                    onClick={applyFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
              {!filtersApplied ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-600">Please select department, semester, and subject filters above and click "Apply Filters" to view notes.</p>
                </div>
              ) : notes.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Displaying {notes.length} notes {searchTerm ? `matching "${searchTerm}"` : ''} 
                      (sorted using merge sort algorithm)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                      <div key={note._id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">{note.title || note.subject}</h3>
                        <p className="text-gray-600 mb-2">{note.topic}</p>
                        <div className="flex justify-between text-sm text-gray-500 mb-3">
                          <span>Semester: {note.semester}</span>
                          <span>{note.departmentType}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadNote(note)}
                            className="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => viewNote(note)}
                            className="flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-600">No notes found for the selected filters. Try different filters or check back later.</p>
                </div>
              )}
            </div>
          )}

          {/* Quizzes Section */}
          {activeSection === 'quizzes' && (
            <div>
              {selectedQuiz ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">{selectedQuiz.title}</h2>
                  {quizResult ? (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Quiz Results</h3>
                      <p>Score: {quizResult.correctAnswers} out of {quizResult.totalQuestions}</p>
                      <p>Percentage: {quizResult.percentage}%</p>
                      <button
                        onClick={() => setSelectedQuiz(null)}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Back to Quizzes
                      </button>
                    </div>
                  ) : (
                    <div>
                      {selectedQuiz.questions.map((question, index) => (
                        <div key={index} className="mb-6">
                          <p className="font-semibold mb-2">{question.question}</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={option}
                                  onChange={(e) => setQuizAnswers(prev => ({
                                    ...prev,
                                    [index]: e.target.value
                                  }))}
                                  className="mr-2"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handleQuizSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map(quiz => (
                    <div key={quiz._id} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-gray-600">{quiz.subject}</p>
                      <p className="text-sm text-gray-500">Duration: {quiz.duration} minutes</p>
                      <p className="text-sm text-gray-500">Due: {new Date(quiz.dueDate).toLocaleDateString()}</p>
                      <button
                        onClick={() => handleQuizStart(quiz)}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Start Quiz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {activeSection === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
                <form onSubmit={handleFeedbackSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Teacher</label>
                    <input
                      type="text"
                      value={feedbackForm.teacher}
                      onChange={(e) => setFeedbackForm(prev => ({
                        ...prev,
                        teacher: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Message</label>
                    <textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm(prev => ({
                        ...prev,
                        message: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Your Feedback History</h2>
                <div className="space-y-4">
                  {feedback.map(item => (
                    <div key={item._id} className="border-b pb-4">
                      <p className="font-semibold">To: {item.teacher.name}</p>
                      <p className="text-gray-600">{item.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Update Profile</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      value={profileForm.section}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        section: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Semester</label>
                    <select
                      value={profileForm.semester}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        semester: e.target.value
                      }))}
                      className="w-full border rounded p-2"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;