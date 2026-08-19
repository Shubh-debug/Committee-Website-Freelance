import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/** Requires a signed-in user (any role). */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner full label="Checking session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

/** Requires the admin role — gate for everything under /admin. */
export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner full label="Checking access…" />;
  if (!isAdmin) return <Navigate to="/" state={{ denied: true }} replace />;
  return children;
}
