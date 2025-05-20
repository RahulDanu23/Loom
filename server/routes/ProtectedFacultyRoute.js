import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedFacultyRoute = ({ redirectPath = '/faculty-login' }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || user.userType !== 'faculty') {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedFacultyRoute;