import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/student-login' }) => {
  const location = useLocation();
  console.log('ProtectedRoute checking auth for path:', location.pathname);
  
  // Check for the appropriate token based on the route
  let token;
  if (location.pathname.includes('faculty')) {
    token = localStorage.getItem('facultyToken');
    console.log('Checking for facultyToken:', !!token);
  } else {
    token = localStorage.getItem('token'); // Student token
    console.log('Checking for student token:', !!token);
  }
  
  if (!token) {
    // Redirect to the appropriate login page
    const redirectTo = location.pathname.includes('faculty') ? '/faculty-login' : '/student-login';
    console.log('No token found, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  console.log('Token found, allowing access to protected route');
  return <Outlet />;
};

export default ProtectedRoute;