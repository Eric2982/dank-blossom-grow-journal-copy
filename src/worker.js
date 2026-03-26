export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/assetlinks.json") {
      const assetlinks = [
        {
          relation: [
            "delegate_permission/common.handle_all_urls",
            "delegate_permission/common.get_login_creds"
          ],
          target: {
            namespace: "android_app",
            package_name: "com.base6994e0c98fb6b9d1d4521dbd.app",
            sha256_cert_fingerprints: [
              "B3:3F:FC:80:DB:13:17:AA:B3:1C:EF:64:30:2A:DE:32:A7:6F:17:CD:85:D6:7E:9D:19:CA:1A:B5:AB:F5:F0:B5"
            ]
          }
        }
      ];

      return new Response(JSON.stringify(assetlinks, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Pass all other requests through to the origin
    return fetch(request);
  }
};