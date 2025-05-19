import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/student-login' }) => {
  // Check if user is authenticated by verifying token in localStorage
  const isAuthenticated = localStorage.getItem('authToken');
  
  // If no token is found, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;