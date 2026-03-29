import { useState, useEffect, useCallback } from 'react';
import { performIntegrityCheck, hasAndroidBridge } from '@/lib/playIntegrity';

/**
 * Possible values for the `status` field returned by usePlayIntegrity.
 *
 * idle        – check not yet started
 * checking    – integrity check in progress
 * verified    – device passed all integrity checks
 * failed      – device did not satisfy integrity requirements
 * unavailable – Play Integrity bridge not present (browser / non-Android env)
 * error       – an unexpected error occurred during the check
 */
export const INTEGRITY_STATUS = Object.freeze({
  IDLE: 'idle',
  CHECKING: 'checking',
  VERIFIED: 'verified',
  FAILED: 'failed',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
});

/**
 * usePlayIntegrity
 *
 * React hook that runs the Google Play Integrity check and exposes the result.
 *
 * @param {object}  [options]
 * @param {boolean} [options.autoCheck=true]  Run the check automatically on mount.
 *
 * @returns {{
 *   status:         string,   one of INTEGRITY_STATUS
 *   verdict:        object|null,  raw verdict from the server
 *   error:          string|null,  error message if status === 'error'
 *   isVerified:     boolean,  true when status is 'verified' or 'unavailable'
 *   isAvailable:    boolean,  true when the Android bridge is present
 *   checkIntegrity: () => Promise<void>  manually trigger (or re-trigger) the check
 * }}
 */
export function usePlayIntegrity({ autoCheck = true } = {}) {
  const [status, setStatus] = useState(INTEGRITY_STATUS.IDLE);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);

  const checkIntegrity = useCallback(async () => {
    setStatus(INTEGRITY_STATUS.CHECKING);
    setError(null);
    setVerdict(null);

    try {
      const result = await performIntegrityCheck();

      if (!result.available) {
        // Running in a browser or an Android WebView without the bridge —
        // treat as unavailable rather than a failure so web users aren't blocked.
        setVerdict(result);
        setStatus(INTEGRITY_STATUS.UNAVAILABLE);
        return;
      }

      setVerdict(result);

      // Evaluate the verdict fields returned by Google's Play Integrity API.
      // MEETS_DEVICE_INTEGRITY is the minimum; MEETS_STRONG_INTEGRITY is stricter.
      const deviceOk =
        Array.isArray(result.deviceIntegrity?.deviceRecognitionVerdict) &&
        result.deviceIntegrity.deviceRecognitionVerdict.some(
          (v) => v === 'MEETS_DEVICE_INTEGRITY' || v === 'MEETS_STRONG_INTEGRITY'
        );

      const appOk =
        result.appIntegrity?.appRecognitionVerdict === 'PLAY_RECOGNIZED';

      setStatus(deviceOk && appOk ? INTEGRITY_STATUS.VERIFIED : INTEGRITY_STATUS.FAILED);
    } catch (err) {
      setError(err.message ?? 'Integrity check failed');
      setStatus(INTEGRITY_STATUS.ERROR);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkIntegrity();
    }
  }, [autoCheck, checkIntegrity]);

  return {
    status,
    verdict,
    error,
    checkIntegrity,
    // Treat 'unavailable' (non-Android env) the same as verified so that
    // the web app and desktop browsers remain fully accessible.
    isVerified:
      status === INTEGRITY_STATUS.VERIFIED || status === INTEGRITY_STATUS.UNAVAILABLE,
    isAvailable: hasAndroidBridge(),
  };
}
