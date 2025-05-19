import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import WelcomePage from './Pages/welcomepage'
import StudentLogin from './Components/StudentLogin' // Fixed casing
import StudentRegister from './Components/StudentRegister' // Fixed casing
import ForgotPassword from './Components/ForgotPassword'
import ResetPasswordConfirm from "./Components/ResetPasswordConfirm";
import StudentDashboard from './Components/StudentDashboard'
import FacultyLogin from './Components/FacultyLogin' // Fixed casing
import FacultyDashboard from './Components/FacultyDashboard'
import ProtectedRoute from './Components/ProtectedRoute'
const App = () => {
  return (
    <BrowserRouter>
      <div>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<WelcomePage />} />
          <Route path='/student-login' element={<StudentLogin />} />
          <Route path='/faculty-login' element={<FacultyLogin />} />
          <Route path='/student-register' element={<StudentRegister />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPasswordConfirm />} />
          
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute redirectPath="/student-login" />}>
            <Route path='/student-dashboard' element={<StudentDashboard />} />
          </Route>
          
          {/* Protected Faculty Routes */}
          <Route element={<ProtectedRoute redirectPath="/faculty-login" />}>
            <Route path='/faculty-dashboard' element={<FacultyDashboard />} />
          </Route>

          {/* Add a catch-all route for 404 pages */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}