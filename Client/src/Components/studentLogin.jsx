import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyLogin = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState('login-form');
  const [loginData, setLoginData] = useState({
    facultyId: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    facultyId: '',
    password: '',
    confirmPassword: '',
    department: 'core'
  });
  const [resetData, setResetData] = useState({ facultyId: '' });
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input changes
  const handleLoginChange = (e) => {
    const { name, value, checked, type } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
  };

  // Form submission handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/faculty/login', {
        facultyId: loginData.facultyId,
        password: loginData.password
      });

      if (response.data.success) {
        // Only store the token for authentication
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');
        // Force a page reload to ensure proper redirection
        window.location.href = '/faculty-dashboard';
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/faculty/register', {
        fullName: registerData.fullName,
        email: registerData.email,
        facultyId: registerData.facultyId,
        password: registerData.password,
        department: registerData.department
      });

      if (response.data.success) {
        // Only store the token for authentication
        localStorage.setItem('token', response.data.token);
        toast.success('Registration successful!');
        window.location.href = '/faculty-dashboard';
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:4000/api/faculty/forgot-password', {
        facultyId: resetData.facultyId
      });
      
      toast.success('Password reset instructions have been sent to your registered email');
      setResetData({ facultyId: '' });
      setActiveForm('login-form');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to process password reset';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Add department options
  const departments = [
    { value: 'core', label: 'Core' },
    { value: 'aiml', label: 'AI & ML' },
    { value: 'cyber', label: 'Cyber Security' },
    { value: 'aids', label: 'AIDS' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-8">
          {/* Back button */}
          <Link to="/" className="text-blue-500 hover:text-blue-700 flex items-center mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            <span>Back</span>
          </Link>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeForm === 'login-form' && (
            <>
              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chalkboard-teacher text-blue-500 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Faculty Portal</h2>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-user-tie"></i>
                    </span>
                    <input
                      type="text"
                      name="facultyId"
                      value={loginData.facultyId}
                      onChange={handleLoginChange}
                      placeholder="Enter your faculty ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showPassword.login ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('login')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword.login ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                      className="mr-2 h-4 w-4 text-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveForm('forgot-password-form')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <i className="fas fa-arrow-right ml-2"></i>
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    New faculty member?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('register-form')}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={loading}
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* Registration Form */}
          {activeForm === 'register-form' && (
            <>
              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-plus text-blue-500 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Faculty Registration</h2>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="facultyId">
                    Faculty ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input
                      type="text"
                      id="facultyId"
                      name="facultyId"
                      value={registerData.facultyId}
                      onChange={handleRegisterChange}
                      placeholder="Faculty ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="department">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={registerData.department}
                    onChange={handleRegisterChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.register ? "text" : "password"}
                      id="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Create Password"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('register')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword.register ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword.confirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Register</span>
                      <i className="fas fa-user-plus ml-2"></i>
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('login-form')}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={loading}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* Forgot Password Form */}
          {activeForm === 'forgot-password-form' && (
            <>
              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-key text-blue-500 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
              </div>

              <form onSubmit={handleResetSubmit}>
                <div className="mb-6">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-user-tie"></i>
                    </span>
                    <input
                      type="text"
                      name="facultyId"
                      value={resetData.facultyId}
                      onChange={handleResetChange}
                      placeholder="Enter your faculty ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <i className="fas fa-paper-plane ml-2"></i>
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Remembered your password?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('login-form')}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={loading}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;