import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import PropTypes from 'prop-types';

export default function ProtectedRoute({ role, redirectPath = '/', message }) {
  const { user, isLoading } = useAuth();
  const location = useLocation(); // Get current location

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ 
          from: location, // Pass current location for post-login redirect
          message: message || 'Please login to continue'
        }}
        replace
      />
    );
  }

  // Check role only if specified in props
  if (role && user.role !== role) {
    return (
      <Navigate
        to={redirectPath}
        state={{ 
          message: message || 'Unauthorized access - Insufficient permissions',
          from: location
        }}
        replace
      />
    );
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  role: PropTypes.oneOf(['teacher', 'student']),
  redirectPath: PropTypes.string,
  message: PropTypes.string
};