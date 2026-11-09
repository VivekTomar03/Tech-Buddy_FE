import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

/** Redirects to /login (remembering where the user was going) when there is no session. */
export default function ProtectedRoute({ children }) {
  const { token, sessionExpired } = useAuthStore();
  const location = useLocation();
  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}${sessionExpired ? '&expired=1' : ''}`} replace />;
  }
  return children;
}

/** For /login and /signup: signed-in users go straight to the dashboard. */
export function GuestRoute({ children }) {
  const { token } = useAuthStore();
  return token ? <Navigate to="/dashboard" replace /> : children;
}
