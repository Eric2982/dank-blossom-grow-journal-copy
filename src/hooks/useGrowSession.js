import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "grow_session";

export function generateSessionId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2).padEnd(5, "0").substring(0, 5).toUpperCase();
  return `GS-${timestamp}-${random}`;
}

export function getElapsedMs(startedAt) {
  return Date.now() - new Date(startedAt).getTime();
}

function loadSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * useGrowSession — manages an active grow session with a persistent session ID.
 *
 * Returns:
 *   session     – current session object ({ id, strainId, startedAt, notes }) or null
 *   isActive    – true when a session is running
 *   startSession(strainId, notes) – begin a new session
 *   endSession()                  – stop the current session
 *   readOutput()                  – return a snapshot of the current session data
 */
export function useGrowSession() {
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    saveSession(session);
  }, [session]);

  const startSession = useCallback((strainId = null, notes = "") => {
    const newSession = {
      id: generateSessionId(),
      strainId,
      startedAt: new Date().toISOString(),
      notes,
    };
    setSession(newSession);
    return newSession;
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  const readOutput = useCallback(() => {
    if (!session) return null;
    return {
      sessionId: session.id,
      strainId: session.strainId,
      startedAt: session.startedAt,
      notes: session.notes,
      elapsedMs: getElapsedMs(session.startedAt),
    };
  }, [session]);

  return {
    session,
    isActive: session !== null,
    startSession,
    endSession,
    readOutput,
  };
}