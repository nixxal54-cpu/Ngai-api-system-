import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';

export function ProtectedRoute({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}
