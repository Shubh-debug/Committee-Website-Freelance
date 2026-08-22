import { Navigate, Outlet, useLocation } from 'react-router-dom';
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

/** Keeps authenticated users out of login and registration pages. */
export function GuestRoute() {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || (user && (profileLoading || !profile))) return <Spinner full label="Checking session…" />;
  if (user) return <Navigate to={profile?.role === 'admin' ? '/admin' : '/profile'} replace />;
  return <Outlet />;
}
