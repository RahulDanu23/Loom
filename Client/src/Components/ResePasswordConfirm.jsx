// Components/ResetPasswordConfirm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { authService } from '../services/api';

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    // Validate token when component mounts
    const validateToken = async () => {
      try {
        // This would be ideal, but for now we'll assume the token is valid until we try to use it
        // Typically, this would be a separate API endpoint to validate the token before showing the form
        setValidToken(true);
      } catch (err) {
        setValidToken(false);
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        setMessage('Password reset successful!');
        toast.success('Password reset successful!');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/student-login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl text-red-500 mb-3">❌</div>
            <h1 className="text-2xl font-bold text-gray-800">Invalid Reset Link</h1>
            <p className="mt-4 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl text-blue-500 mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
          {email && (
            <p className="mt-2 text-gray-600">For account: {email}</p>
          )}
        </div>
        
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                🔑
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password" 
                className="w-full px-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                minLength="8"
              />
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                🔐
              </span>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password" 
                className="w-full px-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                minLength="8"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:translate-y-[-2px] flex items-center justify-center gap-3"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span className="text-lg">Set New Password</span>
                <span className="text-xl">✅</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;