import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { base44 } from '@/api/base44Client';

import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { NavigationProvider } from '@/lib/NavigationContext';
import IntegrityGuard from '@/components/IntegrityGuard';
import Layout from './Layout';

// Page imports
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Challenges from './pages/Challenges';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Learn from './pages/Learn';
import Nutrients from './pages/Nutrients';
import Premium from './pages/Premium';
import Settings from './pages/Settings';
import Store from './pages/Store';
import StrainDetail from './pages/StrainDetail';
import Summary from './pages/Summary';

const LayoutWrapper = ({ children, currentPageName }) => (
  <Layout currentPageName={currentPageName}>{children}</Layout>
);

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
    <div className="w-8 h-8 border-4 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></div>
  </div>
);

const AuthCallbackHandler = () => {
  return <Navigate to="/" replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Router] Auth state changed — isLoadingAuth:', isLoadingAuth, '| isAuthenticated:', isAuthenticated, '| authError:', authError?.type ?? 'none', '| pathname:', window.location.pathname);
  }, [isLoadingAuth, isAuthenticated, authError]);

  useEffect(() => {
    if (!isLoadingAuth && authError?.type === 'auth_required') {
      console.warn('[Router] auth_required — redirecting to login. Current URL:', window.location.href);
      base44.auth.redirectToLogin(window.location.origin + '/');
    }
  }, [isLoadingAuth, authError]);

  // After auth check completes and user is authenticated, ensure we're on a valid route.
  // Use React Router's navigate() so the layout updates in-place without a hard reload.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const validPaths = ['/', '/Dashboard', '/Analytics', '/Challenges', '/Chat', '/Community', '/Learn', '/Nutrients', '/Premium', '/Settings', '/Store', '/StrainDetail', '/Summary'];
      const currentPath = window.location.pathname;
      const isValid = validPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
      console.log('[Router] Authenticated — path:', currentPath, '| isValidRoute:', isValid, '| user:', user?.email);
      if (!isValid) {
        console.warn('[Router] Unknown path after auth — navigating to /');
        navigate('/', { replace: true });
      }
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  if (isLoadingAuth) {
    console.log('[Router] Rendering: <Spinner> (loading auth)');
    return <Spinner />;
  }

  if (authError?.type === 'user_not_registered') {
    console.warn('[Router] Rendering: <UserNotRegisteredError>');
    return <UserNotRegisteredError />;
  }

  if (authError?.type === 'auth_required') {
    console.warn('[Router] Rendering: <Spinner> (auth_required, awaiting redirect)');
    return <Spinner />;
  }

  console.log('[Router] Rendering: <Routes> — user:', user?.email, '| path:', window.location.pathname);

  return (
    <Routes>
      <Route path="/" element={<LayoutWrapper currentPageName="Dashboard"><Dashboard /></LayoutWrapper>} />
      <Route path="/Dashboard" element={<Navigate to="/" replace />} />
      {/* Auth callback paths — always redirect to home after token is consumed */}
      <Route path="/auth" element={<AuthCallbackHandler />} />
      <Route path="/auth/*" element={<AuthCallbackHandler />} />
      <Route path="/Analytics" element={<LayoutWrapper currentPageName="Analytics"><Analytics /></LayoutWrapper>} />
      <Route path="/Challenges" element={<LayoutWrapper currentPageName="Challenges"><Challenges /></LayoutWrapper>} />
      <Route path="/Chat" element={<LayoutWrapper currentPageName="Chat"><Chat /></LayoutWrapper>} />
      <Route path="/Community" element={<LayoutWrapper currentPageName="Community"><Community /></LayoutWrapper>} />
      <Route path="/Learn" element={<LayoutWrapper currentPageName="Learn"><Learn /></LayoutWrapper>} />
      <Route path="/Nutrients" element={<LayoutWrapper currentPageName="Nutrients"><Nutrients /></LayoutWrapper>} />
      <Route path="/Premium" element={<LayoutWrapper currentPageName="Premium"><Premium /></LayoutWrapper>} />
      <Route path="/Settings" element={<LayoutWrapper currentPageName="Settings"><Settings /></LayoutWrapper>} />
      <Route path="/Store" element={<LayoutWrapper currentPageName="Store"><Store /></LayoutWrapper>} />
      <Route path="/StrainDetail" element={<LayoutWrapper currentPageName="StrainDetail"><StrainDetail /></LayoutWrapper>} />
      <Route path="/Summary" element={<LayoutWrapper currentPageName="Summary"><Summary /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationProvider>
            <IntegrityGuard>
              <AuthenticatedApp />
            </IntegrityGuard>
          </NavigationProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;