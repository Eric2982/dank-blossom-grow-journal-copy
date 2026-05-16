import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessToken = urlParams.has('access_token');
    console.log('[Auth] Init — pathname:', window.location.pathname, '| search:', window.location.search, '| hasAccessToken:', hasAccessToken);
    if (hasAccessToken) {
      console.log('[Auth] access_token detected in URL — hard-redirecting to / for clean mount');
      window.location.replace('/');
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    console.log('[Auth] checkAuth() called — pathname:', window.location.pathname);
    try {
      const currentUser = await base44.auth.me();
      console.log('[Auth] base44.auth.me() success — user:', currentUser?.email, '| role:', currentUser?.role, '| id:', currentUser?.id);
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[Auth] base44.auth.me() threw an error:', error);
      console.error('[Auth] error.status:', error?.status, '| error.data:', JSON.stringify(error?.data));
      setIsAuthenticated(false);
      setUser(null);
      if (error?.status === 403 && error?.data?.extra_data?.reason === 'user_not_registered') {
        console.warn('[Auth] Setting authError: user_not_registered');
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      } else {
        console.warn('[Auth] Setting authError: auth_required');
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.origin + '/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false, // kept for compatibility
      authError,
      appPublicSettings: null,
      logout: () => base44.auth.logout(),
      navigateToLogin,
      checkAppState: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};