import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Expected SHA-256 certificate fingerprint for the release signing key,
// taken from /.well-known/assetlinks.json (colon-separated hex → lowercase hex).
const EXPECTED_CERT_SHA256 =
  "B3:3F:FC:80:DB:13:17:AA:B3:1C:EF:64:30:2A:DE:32:A7:6F:17:CD:85:D6:7E:9D:19:CA:1A:B5:AB:F5:F0:B5"
    .replace(/:/g, "")
    .toLowerCase();

// Get a Google OAuth2 access token from the service account JSON
async function getAccessToken(serviceAccountJson) {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/playintegrity",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the private key
  const pemKey = sa.private_key;
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const derBuffer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    derBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrityToken, packageName, nonce } = await req.json();
    if (!integrityToken || !packageName) {
      return Response.json({ error: "integrityToken and packageName are required" }, { status: 400 });
    }

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      return Response.json({ error: "Server not configured: missing GOOGLE_SERVICE_ACCOUNT_JSON" }, { status: 503 });
    }
    const accessToken = await getAccessToken(serviceAccountJson);

    // Call Play Integrity API to decode and verify the token
    const integrityRes = await fetch(
      `https://playintegrity.googleapis.com/v1/${packageName}:decodeIntegrityToken`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ integrity_token: integrityToken }),
      }
    );

    if (!integrityRes.ok) {
      const err = await integrityRes.text();
      return Response.json({ error: `Play Integrity API error: ${err}` }, { status: 500 });
    }

    const verdict = await integrityRes.json();
    const tokenPayload = verdict.tokenPayloadExternal;

    // Validate nonce to prevent token replay attacks
    if (nonce) {
      const tokenNonce = tokenPayload?.requestDetails?.nonce;
      if (!tokenNonce || tokenNonce !== nonce) {
        return Response.json({
          error: "Nonce mismatch: integrity token does not match this request",
        }, { status: 400 });
      }
    }

    // Check app recognition
    const appVerdict = tokenPayload?.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return Response.json({
        allowed: false,
        reason: `App not recognized by Play: ${appVerdict}`,
        verdict: tokenPayload,
      }, { status: 403 });
    }

    // Verify the signing certificate SHA-256 digest to ensure the token was
    // issued for the official release build and not a repackaged / re-signed APK.
    const certDigests: string[] = tokenPayload?.appIntegrity?.certificateSha256Digest ?? [];
    const certMatch = certDigests.some(
      (d) => d.toLowerCase() === EXPECTED_CERT_SHA256
    );
    if (!certMatch) {
      return Response.json({
        allowed: false,
        reason: "App certificate SHA-256 digest does not match the expected signing certificate",
        verdict: tokenPayload,
      }, { status: 403 });
    }

    // Check device integrity — require at least MEETS_DEVICE_INTEGRITY
    // (consistent with the client-side usePlayIntegrity.js check).
    const deviceVerdicts = tokenPayload?.deviceIntegrity?.deviceRecognitionVerdict || [];
    const meetsDevice =
      deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY") ||
      deviceVerdicts.includes("MEETS_STRONG_INTEGRITY");
    if (!meetsDevice) {
      return Response.json({
        allowed: false,
        reason: "Device does not meet device integrity requirements",
        verdict: tokenPayload,
      }, { status: 403 });
    }

    // Check licensing
    const licensingVerdict = tokenPayload?.accountDetails?.appLicensingVerdict;
    if (licensingVerdict !== "LICENSED") {
      return Response.json({
        allowed: false,
        reason: `App not licensed: ${licensingVerdict}`,
        verdict: tokenPayload,
      }, { status: 403 });
    }

    return Response.json({ allowed: true, verdict: tokenPayload });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});