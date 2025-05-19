import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset link sent to your email!');
      } else {
        setError(response.data.message || 'Failed to send reset link');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'An error occurred');
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">   
        <div className="text-center mb-8">
          <div className="text-5xl text-blue-500 mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        </div>
        
        {success ? (
          <div className="text-center">
            <div className="p-4 mb-4 bg-green-50 text-green-700 rounded-md">
              Password reset link has been sent to your email.
              Please check your inbox and follow the instructions.
            </div>
            <button
              onClick={() => navigate('/student-login')}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                  ✉️
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full px-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:translate-y-[-2px] flex items-center justify-center gap-3"
              disabled={loading}
            >
              <span className="text-lg">{loading ? 'Sending...' : 'Reset Password'}</span>
              <span className="text-xl">🚀</span>
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Remember your password?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/student-login');
                  }}
                  className="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Back to Login
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;