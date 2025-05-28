import React, { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaUsers, FaHashtag, 
  FaEye, FaEyeSlash, FaUserGraduate, FaBookOpen, FaLayerGroup, FaLock 
} from 'react-icons/fa';

const InputField = ({ 
  icon, type, name, placeholder, value, onChange, 
  required = true, options, isPassword = false, fieldName, showPassword, onTogglePassword 
}) => {
  const inputRef = useRef(null);
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 appearance-none"
        >
          <option value="">{placeholder}</option>
          {options && options.map((option, index) => (
            <option 
              key={option.value || option || `option-${index}`} 
              value={option.value || option}
            >
              {option.label || option}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={isPassword ? 'new-password' : 'off'}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          />
          {isPassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const StudentRegister = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    semester: '',
    department: '',
    section: '',
    universityRoll: '',
    classRoll: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = [
    { value: 'core', label: 'B.Tech Computer Science (Core)' },
    { value: 'aiml', label: 'B.Tech Computer Science (AI & ML)' },
    { value: 'cyber', label: 'B.Tech Computer Science (Cybersecurity)' },
    { value: 'aids', label: 'B.Tech Computer Science (AI & Data Science)' }
  ];

  const semesters = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  const sections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'G1', 'G2', 'H1', 'H2', 'I1', 'I2', 'J1', 'J2', 'K1', 'K2', 'L1', 'L2', 'M1', 'M2', 'N1', 'N2'];

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting registration data...');
      const response = await axios.post('http://localhost:5000/api/students/register', {
        name: formData.fullName,
        email: formData.email,
        universityRollNo: formData.universityRoll,
        classRollNo: formData.classRoll,
        section: formData.section,
        semester: formData.semester,
        department: formData.department,
        password: formData.password
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        toast.success('Registration successful! Redirecting to login page...');
        
        // Add a delay before redirection to ensure the toast is visible
        setTimeout(() => {
          navigate('/student-login');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative">
            <Link to="/" className="absolute left-4 top-4">
              <button
                type="button"
                className="p-2 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                ←
              </button>
            </Link>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-full">
                <FaUserGraduate className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Student Registration</h1>
            <p className="text-blue-100 mt-2">Create your account to get started</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <InputField
                  icon={<FaUser className="h-5 w-5 text-gray-400" />}
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />

                {/* Email */}
                <InputField
                  icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />

                {/* Semester */}
                <InputField
                  icon={<FaLayerGroup className="h-5 w-5 text-gray-400" />}
                  type="select"
                  name="semester"
                  placeholder="Select Semester"
                  value={formData.semester}
                  onChange={handleChange}
                  options={semesters.map(s => ({ value: s, label: `Semester ${s}` }))}
                />

                {/* Department */}
                <InputField
                  icon={<FaBookOpen className="h-5 w-5 text-gray-400" />}
                  type="select"
                  name="department"
                  placeholder="Select Department"
                  value={formData.department}
                  onChange={handleChange}
                  options={departments}
                />

                {/* Section */}
                <InputField
                  icon={<FaUsers className="h-5 w-5 text-gray-400" />}
                  type="select"
                  name="section"
                  placeholder="Select Section"
                  value={formData.section}
                  onChange={handleChange}
                  options={sections.map(s => ({ value: s, label: s }))}
                />

                {/* University Roll No */}
                <InputField
                  icon={<FaHashtag className="h-5 w-5 text-gray-400" />}
                  type="text"
                  name="universityRoll"
                  placeholder="University Roll Number"
                  value={formData.universityRoll}
                  onChange={handleChange}
                />

                {/* Class Roll No */}
                <InputField
                  icon={<FaHashtag className="h-5 w-5 text-gray-400" />}
                  type="text"
                  name="classRoll"
                  placeholder="Class Roll Number"
                  value={formData.classRoll}
                  onChange={handleChange}
                />

                {/* Password */}
                <InputField
                  icon={<FaLock className="h-5 w-5 text-gray-400" />}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  isPassword={true}
                  fieldName="password"
                  showPassword={showPassword.password}
                  onTogglePassword={() => togglePasswordVisibility('password')}
                />

                {/* Confirm Password */}
                <InputField
                  icon={<FaLock className="h-5 w-5 text-gray-400" />}
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isPassword={true}
                  fieldName="confirmPassword"
                  showPassword={showPassword.confirmPassword}
                  onTogglePassword={() => togglePasswordVisibility('confirmPassword')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  Already have an account?{' '}
                  <Link to="/student-login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;