/**
 * Cloudflare Worker — Dank Blossom app entry point
 *
 * Handles:
 *   POST /api/play-integrity/verify  – decodes and verifies a Play Integrity
 *                                      token via Google's Play Integrity API
 *
 * All other requests are forwarded to the static asset bundle (React SPA).
 *
 * Required environment variables (set in the Cloudflare dashboard or
 * wrangler secret put):
 *
 *   PLAY_INTEGRITY_PACKAGE_NAME     – Android package name, e.g.
 *                                     "com.base6994e0c98fb6b9d1d4521dbd.app"
 *   PLAY_INTEGRITY_SERVICE_ACCOUNT  – Full JSON string of a Google service
 *                                     account key that has the
 *                                     "playintegrity.googleapis.com" API
 *                                     enabled in its Cloud project.
 */

// ─── Google OAuth2 / Service-account helpers ──────────────────────────────────

/**
 * Imports an RSA private key from a PEM-encoded PKCS#8 string using the
 * Web Crypto API (available in Cloudflare Workers).
 */
async function importRsaPrivateKey(pem) {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

/** Encodes a value as base64url (no padding). */
function toBase64Url(data) {
  const b64 =
    typeof data === 'string'
      ? btoa(data)
      : btoa(String.fromCharCode(...new Uint8Array(data)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Obtains a short-lived Google OAuth2 access token for the
 * "playintegrity" scope using JWT Bearer grant with the service account key.
 *
 * @param {string} serviceAccountJson – raw JSON string of the service account
 * @returns {Promise<string>} access token
 */
async function getGoogleAccessToken(serviceAccountJson) {
  const { client_email, private_key } = JSON.parse(serviceAccountJson);

  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = toBase64Url(
    JSON.stringify({
      iss: client_email,
      scope: 'https://www.googleapis.com/auth/playintegrity',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );

  const message = `${header}.${claim}`;
  const privateKey = await importRsaPrivateKey(private_key.replace(/\\n/g, '\n'));
  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(message)
  );

  const jwt = `${message}.${toBase64Url(sigBuffer)}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Failed to obtain Google access token: ${text}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

// ─── Play Integrity verification ─────────────────────────────────────────────

/**
 * Calls Google's Play Integrity decodeIntegrityToken endpoint.
 *
 * @param {string} integrityToken  – encrypted token from the Android client
 * @param {string} packageName     – Android package name
 * @param {string} accessToken     – Google OAuth2 access token
 * @returns {Promise<object>}       decoded integrity verdict
 */
async function decodeIntegrityToken(integrityToken, packageName, accessToken) {
  const url = `https://playintegrity.googleapis.com/v1/${packageName}:decodeIntegrityToken`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ integrity_token: integrityToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.error?.message ?? `Play Integrity API error (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.tokenPayloadExternal;
}

// ─── Request handlers ─────────────────────────────────────────────────────────

/**
 * Handles POST /api/play-integrity/verify
 *
 * Body: { token: string, nonce: string }
 *
 * Success response:
 * {
 *   requestDetails:  { requestPackageName, nonce, timestampMillis }
 *   appIntegrity:    { appRecognitionVerdict, packageName, certificateSha256Digest, versionCode }
 *   deviceIntegrity: { deviceRecognitionVerdict[] }
 *   accountDetails:  { appLicensingVerdict }
 * }
 */
async function handleVerify(request, env) {
  // Validate required environment variables
  if (!env.PLAY_INTEGRITY_SERVICE_ACCOUNT || !env.PLAY_INTEGRITY_PACKAGE_NAME) {
    return jsonError(
      'Play Integrity is not configured on the server. ' +
        'Set PLAY_INTEGRITY_SERVICE_ACCOUNT and PLAY_INTEGRITY_PACKAGE_NAME.',
      503
    );
  }

  // Parse and validate the request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  const { token, nonce } = body ?? {};

  if (!token || typeof token !== 'string') {
    return jsonError('Missing or invalid "token" field.', 400);
  }
  if (!nonce || typeof nonce !== 'string') {
    return jsonError('Missing or invalid "nonce" field.', 400);
  }

  // Obtain a Google access token and decode the integrity token
  try {
    const accessToken = await getGoogleAccessToken(env.PLAY_INTEGRITY_SERVICE_ACCOUNT);
    const verdict = await decodeIntegrityToken(
      token,
      env.PLAY_INTEGRITY_PACKAGE_NAME,
      accessToken
    );

    // Surface only the verdict fields (do not echo back the raw JWT)
    return jsonResponse(verdict, 200);
  } catch (err) {
    return jsonError(err.message, 502);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function jsonError(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

// ─── Main fetch handler ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── API routes ──────────────────────────────────────────────────────────
    if (
      url.pathname === '/api/play-integrity/verify' &&
      request.method === 'POST'
    ) {
      return handleVerify(request, env);
    }

    // ── Static assets (React SPA) ───────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
