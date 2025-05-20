import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/student-login' }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login page with the return url
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;