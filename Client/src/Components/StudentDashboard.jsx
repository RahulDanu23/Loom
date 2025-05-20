import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    subject: '',
    search: ''
  });
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/student-login');
      return;
    }
  
    // Set authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
    // Load student profile first
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Get current student data from the /me endpoint
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
        
        // After profile is loaded, load notes with department
        if (studentData.department) {
          try {
            const notesRes = await axios.get(`http://localhost:5000/api/notes/department/${studentData.department}`);
            setNotes(Array.isArray(notesRes.data.notes) ? notesRes.data.notes : []);
          } catch (noteErr) {
            console.error('Error loading notes:', noteErr);
            toast.error('Failed to load notes. Please try again later.');
          }
        }
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
      const res = await axios.get('http://localhost:5000/api/notes/department/' + student?.department);
      setNotes(Array.isArray(res.data.notes) ? res.data.notes : []);
    } catch (err) {
      console.error('Error loading notes:', err);
      setNotes([]); // Ensure notes is always an array even if there's an error
    }
  };

  const loadQuizzes = async () => {
    try {
      const res = await axios.get('/api/quizzes', { params: filters });
      setQuizzes(res.data);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  };

  const loadFeedback = async () => {
    try {
      const res = await axios.get('/api/feedback/my-feedback');
      setFeedback(res.data);
    } catch (err) {
      console.error('Error loading feedback:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    loadNotes();
    loadQuizzes();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', feedbackForm);
      setFeedbackForm({ teacher: '', message: '' });
      loadFeedback();
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/students/me', profileForm);
      loadProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleQuizStart = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleQuizSubmit = async () => {
    try {
      const res = await axios.post(`/api/quizzes/${selectedQuiz._id}/submit`, { answers: quizAnswers });
      setQuizResult(res.data);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const downloadNote = (note) => {
    const link = document.createElement('a');
    link.href = `data:${note.fileType};base64,${note.fileContent}`;
    link.download = note.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewNote = (note) => {
    window.open(`data:${note.fileType};base64,${note.fileContent}`, '_blank');
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Student Dashboard</h2>
            <nav>
              <button
                onClick={() => setActiveSection('notes')}
                className={`block w-full text-left p-2 mb-2 rounded ${
                  activeSection === 'notes' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveSection('quizzes')}
                className={`block w-full text-left p-2 mb-2 rounded ${
                  activeSection === 'quizzes' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Quizzes
              </button>
              <button
                onClick={() => setActiveSection('feedback')}
                className={`block w-full text-left p-2 mb-2 rounded ${
                  activeSection === 'feedback' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setActiveSection('profile')}
                className={`block w-full text-left p-2 mb-2 rounded ${
                  activeSection === 'profile' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">All Departments</option>
                <option value="core">Core</option>
                <option value="aiml">AIML</option>
                <option value="cyber">Cyber</option>
                <option value="aids">AIDS</option>
              </select>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="border rounded p-2"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                placeholder="Subject"
                className="border rounded p-2"
              />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search"
                className="border rounded p-2"
              />
            </div>
            <button
              onClick={applyFilters}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>

        {/* Notes Section */}
        {activeSection === 'notes' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                  <div key={note._id} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold">{note.title}</h3>
                    <p className="text-gray-600">{note.description}</p>
                    <p className="text-sm text-gray-500">Uploaded by: {note.uploadedBy?.fullName || 'Unknown'}</p>
                    <div className="mt-4 flex space-x-2">
                      <a
                        href={`http://localhost:5000${note.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No notes available for your department yet.</p>
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