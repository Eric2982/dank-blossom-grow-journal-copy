import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

// Maximum time (ms) to wait for the auth check before treating it as failed.
const AUTH_TIMEOUT_MS = 15000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  // Track whether the component is still mounted so we never update state
  // on an unmounted component (e.g. during hot-reload or strict-mode double-invoke).
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

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

    // Actively listen for token changes in localStorage so the app reacts
    // to session changes (e.g. login/logout in another tab, popup OAuth
    // flows that write the token directly to storage).
    const handleStorage = (event) => {
      if (event.key === 'base44_access_token' || event.key === 'token') {
        console.log('[Auth] storage event — key:', event.key, '| newValue:', event.newValue ? '[present]' : 'null');
        checkAuth();
      }
    };

    // Re-validate the session whenever the user returns to this tab.
    // This catches cases where the session expired while the tab was hidden.
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

    // Safety net: if the auth request never resolves, clear the loading state
    // after AUTH_TIMEOUT_MS so the app does not get permanently stuck on a
    // blank loading screen.
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('auth_timeout'));
      }, AUTH_TIMEOUT_MS);
    });

    try {
      const currentUser = await Promise.race([base44.auth.me(), timeoutPromise]);
      clearTimeout(timeoutId);
      console.log('[Auth] base44.auth.me() success — user:', currentUser?.email, '| role:', currentUser?.role, '| id:', currentUser?.id);
      if (!isMountedRef.current) return;
      setUser(currentUser);
      setIsAuthenticated(true);
      // Explicitly clear loading immediately after a successful resolution so
      // the authenticated layout is shown without waiting for the finally block.
      setIsLoadingAuth(false);
    } catch (error) {
      clearTimeout(timeoutId);
      if (!isMountedRef.current) return;
      console.error('[Auth] base44.auth.me() threw an error:', error);
      console.error('[Auth] error.status:', error?.status, '| error.data:', JSON.stringify(error?.data));
      setIsAuthenticated(false);
      setUser(null);
      if (error?.message === 'auth_timeout') {
        console.warn('[Auth] Auth check timed out — treating as auth_required');
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      } else if (error?.status === 403 && error?.data?.extra_data?.reason === 'user_not_registered') {
        console.warn('[Auth] Setting authError: user_not_registered');
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      } else {
        console.warn('[Auth] Setting authError: auth_required');
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      // Always clear loading — this is the guaranteed safety net even if an
      // unexpected exception bypasses the catch block above.
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