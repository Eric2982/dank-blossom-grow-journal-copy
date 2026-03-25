import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    const { integrityToken, packageName } = await req.json();
    if (!integrityToken || !packageName) {
      return Response.json({ error: "integrityToken and packageName are required" }, { status: 400 });
    }

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
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

    // Check app recognition
    const appVerdict = tokenPayload?.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return Response.json({
        allowed: false,
        reason: `App not recognized by Play: ${appVerdict}`,
        verdict: tokenPayload,
      }, { status: 403 });
    }

    // Check device integrity
    const deviceVerdicts = tokenPayload?.deviceIntegrity?.deviceRecognitionVerdict || [];
    const meetsBasic = deviceVerdicts.includes("MEETS_BASIC_INTEGRITY");
    if (!meetsBasic) {
      return Response.json({
        allowed: false,
        reason: "Device does not meet basic integrity",
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