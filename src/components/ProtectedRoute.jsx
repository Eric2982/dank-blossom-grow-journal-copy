import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
    <div className="w-8 h-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback /> }) {
  const { isAuthenticated, isLoadingAuth, authError, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [isLoadingAuth, authError, navigateToLogin]);

  if (isLoadingAuth) return fallback;

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (!isAuthenticated) return fallback;

  return <Outlet />;
}