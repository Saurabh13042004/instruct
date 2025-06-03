import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredType }) {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If requiredType is specified and doesn't match, redirect
  if (requiredType && userType !== requiredType) {
    // Redirect non-admins to homepage if trying to access admin page
    if (requiredType === 'admin') {
      return <Navigate to="/" />;
    }
    // Add other type-specific redirects as needed
  }
  
  return children;
}

export default ProtectedRoute;