import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const AUTH_TIMEOUT_MS = 15000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    // app-params.js already reads + removes access_token from the URL at module
    // load time and passes it to the SDK client. By the time this effect runs,
    // the token is already in localStorage / SDK state. Just call checkAuth.
    console.log('[Auth] Init — pathname:', window.location.pathname);
    checkAuth();

    const handleStorage = (event) => {
      if (event.key === 'base44_access_token' || event.key === 'token') {
        console.log('[Auth] storage event — key:', event.key, '| newValue:', event.newValue ? '[present]' : 'null');
        checkAuth();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Auth] Tab visible — re-checking auth session');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    if (!isMountedRef.current) return;
    setIsLoadingAuth(true);
    setAuthError(null);
    console.log('[Auth] checkAuth() called — pathname:', window.location.pathname);

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('auth_timeout'));
      }, AUTH_TIMEOUT_MS);
    });

    try {
      const currentUser = await Promise.race([base44.auth.me(), timeoutPromise]);
      clearTimeout(timeoutId);
      console.log('[Auth] me() success — user:', currentUser?.email, '| role:', currentUser?.role);
      if (!isMountedRef.current) return;
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      clearTimeout(timeoutId);
      if (!isMountedRef.current) return;
      console.error('[Auth] me() error — status:', error?.status, '| message:', error?.message, '| data:', JSON.stringify(error?.data));
      setIsAuthenticated(false);
      setUser(null);
      if (error?.message === 'auth_timeout') {
        console.warn('[Auth] Timed out — treating as auth_required');
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else if (error?.status === 403 && error?.data?.extra_data?.reason === 'user_not_registered') {
        console.warn('[Auth] user_not_registered');
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      } else {
        console.warn('[Auth] auth_required');
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAuth(false);
      }
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
      isLoadingPublicSettings: false,
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