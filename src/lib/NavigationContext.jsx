import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext({
  direction: 'tab',
  navigateTo: () => {},
  goBack: () => {},
  canGoBack: () => false,
});

const TAB_ROOTS = ['/', '/Chat', '/Summary', '/Challenges', '/Settings'];

function getTabRoot(path) {
  return TAB_ROOTS.find(t => t === path || (t !== '/' && path.startsWith(t))) || '/';
}

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [direction, setDirection] = useState('tab');
  const [stackMap, setStackMap] = useState(() =>
    Object.fromEntries(TAB_ROOTS.map(t => [t, [t]]))
  );

  const navigateTo = useCallback((path) => {
    const isTab = TAB_ROOTS.includes(path);
    if (isTab) {
      setDirection('tab');
    } else {
      setDirection('forward');
      const tab = getTabRoot(location.pathname);
      setStackMap(prev => ({ ...prev, [tab]: [...(prev[tab] || [tab]), path] }));
    }
    navigate(path);
  }, [navigate, location.pathname]);

  const goBack = useCallback(() => {
    const tab = getTabRoot(location.pathname);
    const stack = stackMap[tab] || [];
    if (stack.length > 1) {
      setDirection('backward');
      const newStack = stack.slice(0, -1);
      setStackMap(prev => ({ ...prev, [tab]: newStack }));
      navigate(newStack[newStack.length - 1]);
    } else {
      setDirection('backward');
      navigate(-1);
    }
  }, [navigate, location.pathname, stackMap]);

  const canGoBack = useCallback(() => {
    const tab = getTabRoot(location.pathname);
    return (stackMap[tab] || []).length > 1;
  }, [location.pathname, stackMap]);

  return (
    <NavigationContext.Provider value={{ direction, navigateTo, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);