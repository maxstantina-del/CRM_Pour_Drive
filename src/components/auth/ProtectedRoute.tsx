import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from './LoginPage';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <>{children}</>;
}
