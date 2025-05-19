import React from 'react'
import { useNavigate } from 'react-router-dom'

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to LOOM</h1>
        <h2 className="text-xl text-gray-700 mb-8">Classroom Assistant</h2>
        
        <button 
          onClick={() => navigate('/student-login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mb-4 hover:bg-blue-700 transition-transform hover:scale-[1.02]"
        >
          Student Login
        </button>
        <button 
          onClick={() => navigate('/faculty-login')}
        className="w-full bg-cyan-700 text-white py-3 rounded-lg hover:bg-cyan-800 transition-transform hover:scale-[1.02]">
          Faculty Login
        </button>
      </div>
    </div>
  )
}

export default WelcomePage