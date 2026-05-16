import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
  const { isLoadingAuth, authError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && authError?.type === 'auth_required') {
      base44.auth.redirectToLogin(window.location.origin + '/');
    }
  }, [isLoadingAuth, authError]);

  // After auth check completes and user is authenticated, ensure we're on a valid route.
  // If the current path is not recognized (e.g. post-login callback left us on /auth or similar),
  // hard-redirect to dashboard so the router re-initializes cleanly.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const validPaths = ['/', '/Dashboard', '/Analytics', '/Challenges', '/Chat', '/Community', '/Learn', '/Nutrients', '/Premium', '/Settings', '/Store', '/StrainDetail', '/Summary'];
      const currentPath = window.location.pathname;
      const isValid = validPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
      if (!isValid) {
        window.location.replace('/');
      }
    }
  }, [isLoadingAuth, isAuthenticated]);

  if (isLoadingAuth) {
    return <Spinner />;
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (authError?.type === 'auth_required') {
    return <Spinner />;
  }

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