import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    confirmPassword: ''
  });
  const [resetData, setResetData] = useState({
    facultyId: ''
  });
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    confirm: false
  });

  const handleLoginChange = (e) => {
    const { name, value, checked, type } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData({
      ...resetData,
      [name]: value
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginData.facultyId && loginData.password) {
      sessionStorage.setItem('facultyId', loginData.facultyId);
      navigate('/faculty-dashboard');
    } else {
      alert('Please enter valid credentials');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (registerData.fullName && registerData.email && registerData.facultyId && registerData.password) {
      alert('Registration successful! Please login with your credentials.');
      setRegisterData({
        fullName: '',
        email: '',
        facultyId: '',
        password: '',
        confirmPassword: ''
      });
      setActiveForm('login-form');
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (resetData.facultyId) {
      alert('Password reset instructions have been sent to your registered email');
      setActiveForm('login-form');
    } else {
      alert('Please enter your faculty ID');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-8">
          {/* Back button */}
          <Link to="/" className="text-blue-500 hover:text-blue-700 flex items-center mb-4">
            <i className="fas fa-arrow-left mr-2"></i>
            <span>Back</span>
          </Link>

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
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('login')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveForm('forgot-password-form')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <span>Login</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    New faculty member?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('register-form')}
                      className="text-blue-500 hover:text-blue-700"
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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input
                      type="text"
                      name="facultyId"
                      value={registerData.facultyId}
                      onChange={handleRegisterChange}
                      placeholder="Faculty ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type={showPassword.register ? "text" : "password"}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Create Password"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('register')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas ${showPassword.register ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas ${showPassword.confirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <span>Register</span>
                  <i className="fas fa-user-plus ml-2"></i>
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('login-form')}
                      className="text-blue-500 hover:text-blue-700"
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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <span>Reset Password</span>
                  <i className="fas fa-paper-plane ml-2"></i>
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Remembered your password?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveForm('login-form')}
                      className="text-blue-500 hover:text-blue-700"
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