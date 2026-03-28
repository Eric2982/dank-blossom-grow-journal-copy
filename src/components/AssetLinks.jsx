import { useEffect } from "react";

const assetlinks = [
  {
    relation: [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds"
    ],
    target: {
      namespace: "android_app",
      package_name: "com.base69be6d60d8aa3924e66d8e69.app",
      sha256_cert_fingerprints: [
        "B7:5B:33:41:01:46:16:F1:A3:66:E0:82:60:81:F4:5C:C9:6C:22:08:B6:F7:51:80:A5:30:01:C1:3B:57:1A:1A"
      ]
    }
  },
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
  },
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "web",
      site: "https://dankblossom.app"
    }
  }
];

export default function AssetLinks() {
  useEffect(() => {
    // Replace the entire document with raw JSON response
    document.open("application/json");
    document.write(JSON.stringify(assetlinks, null, 2));
    document.close();
  }, []);

  return null;
}