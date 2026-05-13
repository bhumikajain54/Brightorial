import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  // Bypass authentication - allow access without login
  return children;
  
  // Original authentication code (commented out for bypass)
  /*
  const isAuthenticated = true
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
  */
}


