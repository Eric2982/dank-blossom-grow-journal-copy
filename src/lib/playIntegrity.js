/**
 * playIntegrity.js
 *
 * Utilities for the Google Play Integrity API client-side flow.
 *
 * Flow overview
 * ─────────────
 * 1. generateNonce()           → cryptographically random base64url nonce
 * 2. requestIntegrityToken()   → calls the Android JS bridge injected by
 *                                PlayIntegrityBridge.java; returns the
 *                                encrypted token from Google Play
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

/** Timeout for the Android bridge call (milliseconds). */
const BRIDGE_TIMEOUT_MS = 15_000;

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
 * The bridge (PlayIntegrityBridge.java) calls Google Play's
 * IntegrityManager.requestIntegrityToken() and returns the encrypted token.
 *
 * @param {string} nonce - Base64url nonce from generateNonce()
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
      reject(new Error('Play Integrity token request timed out'));
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
 * @returns {Promise<object>} integrity verdict or { available: false }
 */
export async function performIntegrityCheck() {
  if (!hasAndroidBridge()) {
    return { available: false };
  }

  const nonce = generateNonce();
  const token = await requestIntegrityToken(nonce);
  const verdict = await verifyIntegrityToken(token, nonce);
  return { available: true, ...verdict };
}
