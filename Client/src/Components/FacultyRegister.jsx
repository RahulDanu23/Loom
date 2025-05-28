import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FaUserTie, FaEnvelope, FaIdCard, FaLock, 
  FaEye, FaEyeSlash, FaBuilding 
} from 'react-icons/fa';

const InputField = ({ 
  icon, 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = true, 
  options, 
  isPassword = false, 
  fieldName,
  showPassword,
  togglePasswordVisibility 
}) => (
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
        {options.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    ) : (
      <div className="relative">
        <input
          type={isPassword ? (showPassword[fieldName] ? 'text' : 'password') : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => togglePasswordVisibility(fieldName)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
          >
            {showPassword[fieldName] ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    )}
  </div>
);

const FacultyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    facultyId: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departments = ['core', 'aiml', 'cyber', 'aids'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/faculty/register', {
        fullName: formData.fullName,
        email: formData.email,
        facultyId: formData.facultyId,
        department: formData.department,
        password: formData.password
      });

      toast.success('Registration successful! Please login.');
      navigate('/faculty-login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
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
                <FaUserTie className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Faculty Registration</h1>
            <p className="text-blue-100 mt-2">Create your faculty account</p>
          </div>
          
          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <InputField
                  icon={<FaUserTie className="h-5 w-5 text-gray-400" />}
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                />

                {/* Email */}
                <InputField
                  icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                />

                {/* Faculty ID */}
                <InputField
                  icon={<FaIdCard className="h-5 w-5 text-gray-400" />}
                  type="text"
                  name="facultyId"
                  placeholder="Faculty ID"
                  value={formData.facultyId}
                  onChange={handleChange}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                />

                {/* Department */}
                <InputField
                  icon={<FaBuilding className="h-5 w-5 text-gray-400" />}
                  type="select"
                  name="department"
                  placeholder="Select Department"
                  value={formData.department}
                  onChange={handleChange}
                  options={departments}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
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
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
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
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/faculty-login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegister;