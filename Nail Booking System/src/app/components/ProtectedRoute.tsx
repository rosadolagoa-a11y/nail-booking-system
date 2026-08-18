import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';

export function ProtectedRoute({ role }: { role: 'designer' | 'client' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  if (!user) {
    return <Navigate to={role === 'designer' ? '/designer/login' : '/login'} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'designer' ? '/designer' : '/'} replace />;
  }

  return <Outlet />;
}
