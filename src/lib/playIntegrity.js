/**
 * playIntegrity.js
 *
 * Utilities for the Google Play Integrity API client-side flow.
 *
 * Flow overview
 * ─────────────
 * 1. generateNonce()           → cryptographically random base64url nonce
 * 2. requestIntegrityToken()   → calls the Android JS bridge injected by
 *                                PlayIntegrityBridge.java; invokes the
 *                                Classic Integrity API via IntegrityManager
 *                                and returns the encrypted token from Google Play
 * 3. verifyIntegrityToken()    → POST the token + nonce to the Cloudflare
 *                                Worker endpoint which decodes it via
 *                                Google's Play Integrity API and returns the
 *                                plain-text verdict
 * 4. performIntegrityCheck()   → convenience wrapper that runs all three steps
 *
 * Android bridge contract
 * ───────────────────────
 * The native wrapper must inject:
 *
 *   window.AndroidPlayIntegrity.requestIntegrityToken(nonce, callbackId)
 *
 * …and resolve/reject via:
 *
 *   window.__playIntegrityCallbacks[callbackId].resolve(token)
 *   window.__playIntegrityCallbacks[callbackId].reject(new Error(msg))
 *
 * See android/app/src/main/java/com/dankblossom/PlayIntegrityBridge.java.
 */

/** Backend endpoint that decodes and verifies the integrity token. */
const VERIFY_ENDPOINT = '/api/play-integrity/verify';

/**
 * Timeout for a single Android bridge call (milliseconds).
 * The Classic Play Integrity API can take up to 30 s on slow networks or
 * on the first call after installation, so allow adequate headroom.
 */
const BRIDGE_TIMEOUT_MS = 30_000;

/** Maximum number of additional attempts after the first, for timeout errors. */
const MAX_RETRIES = 2;

/** Base delay between retry attempts (milliseconds); doubles on each retry. */
const RETRY_BASE_DELAY_MS = 1_000;

// ─── Nonce ────────────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random nonce.
 *
 * The nonce must be:
 *   • Base64url encoded (URL-safe, no padding)
 *   • Decoded length 16 – 500 bytes
 *   • Unpredictable (use crypto.getRandomValues, never Math.random)
 *
 * @returns {string} 43-character base64url string (32 bytes of entropy)
 */
export function generateNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ─── Environment detection ────────────────────────────────────────────────────

/**
 * Returns true when the page is loaded inside an Android WebView.
 * Heuristic: user agent contains "Android" and the "wv" WebView marker.
 */
export function isAndroidWebView() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent ?? '';
  return /Android/.test(ua) && /wv/.test(ua);
}

/**
 * Returns true when the PlayIntegrityBridge JavaScript interface has been
 * injected by the native Android wrapper.
 */
export function hasAndroidBridge() {
  return (
    typeof window !== 'undefined' &&
    typeof window.AndroidPlayIntegrity !== 'undefined' &&
    typeof window.AndroidPlayIntegrity.requestIntegrityToken === 'function'
  );
}

// ─── Token request ────────────────────────────────────────────────────────────

/**
 * Requests a Play Integrity token from the Android native bridge.
 *
 * The bridge (PlayIntegrityBridge.java) uses the Classic Integrity API,
 * calling IntegrityManager.requestIntegrityToken() with the nonce and
 * returning the encrypted token.
 *
 * @param {string} nonce - Base64url-encoded request hash from generateNonce()
 * @returns {Promise<string>} encrypted integrity token
 */
export function requestIntegrityToken(nonce) {
  if (!hasAndroidBridge()) {
    return Promise.reject(new Error('Android Play Integrity bridge is not available'));
  }

  return new Promise((resolve, reject) => {
    // Initialise the global callback registry if not already present
    if (!window.__playIntegrityCallbacks) {
      window.__playIntegrityCallbacks = Object.create(null);
    }

    const callbackId = `pic_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Auto-clean and timeout guard
    const timer = setTimeout(() => {
      delete window.__playIntegrityCallbacks[callbackId];
      const err = new Error('Play Integrity token request timed out');
      err.code = 'PLAY_INTEGRITY_TIMEOUT';
      reject(err);
    }, BRIDGE_TIMEOUT_MS);

    window.__playIntegrityCallbacks[callbackId] = {
      resolve(token) {
        clearTimeout(timer);
        delete window.__playIntegrityCallbacks[callbackId];
        resolve(token);
      },
      reject(err) {
        clearTimeout(timer);
        delete window.__playIntegrityCallbacks[callbackId];
        reject(err);
      },
    };

    // Invoke the native bridge (non-blocking; result comes back via callbacks)
    window.AndroidPlayIntegrity.requestIntegrityToken(nonce, callbackId);
  });
}

// ─── Token verification ───────────────────────────────────────────────────────

/**
 * Verifies the integrity token with the Cloudflare Worker backend.
 *
 * The Worker sends the token to Google's Play Integrity
 * decodeIntegrityToken API and returns the plain-text verdict object:
 *
 * {
 *   requestDetails:  { requestPackageName, nonce, timestampMillis }
 *   appIntegrity:    { appRecognitionVerdict, packageName, certificateSha256Digest, versionCode }
 *   deviceIntegrity: { deviceRecognitionVerdict[] }
 *   accountDetails:  { appLicensingVerdict }
 * }
 *
 * @param {string} token - Encrypted token from requestIntegrityToken()
 * @param {string} nonce - The nonce that was used to request the token
 * @returns {Promise<object>} decoded integrity verdict
 */
export async function verifyIntegrityToken(token, nonce) {
  const response = await fetch(VERIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nonce }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Verification failed (HTTP ${response.status})`);
  }

  return response.json();
}

// ─── Full check ───────────────────────────────────────────────────────────────

/**
 * Convenience function that runs the complete integrity check:
 *   generate nonce → request token → verify with backend
 *
 * When the Android bridge is not present (e.g. browser / desktop) the
 * function resolves with { available: false } instead of throwing, allowing
 * the app to degrade gracefully on non-Android environments.
 *
 * Timeout errors from the Android bridge are retried up to MAX_RETRIES times
 * with exponential back-off before the error is surfaced to the caller.
 *
 * @returns {Promise<object>} integrity verdict or { available: false }
 */
export async function performIntegrityCheck() {
  if (!hasAndroidBridge()) {
    return { available: false };
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential back-off: 1 s, 2 s, …
      await new Promise((res) => setTimeout(res, RETRY_BASE_DELAY_MS * (2 ** (attempt - 1))));
    }

    try {
      const nonce = generateNonce();
      const token = await requestIntegrityToken(nonce);
      const verdict = await verifyIntegrityToken(token, nonce);
      return { available: true, ...verdict };
    } catch (err) {
      lastError = err;
      // Only retry transient timeout failures; surface all other errors immediately.
      if (err.code !== 'PLAY_INTEGRITY_TIMEOUT') {
        throw err;
      }
    }
  }

  throw lastError;
}
