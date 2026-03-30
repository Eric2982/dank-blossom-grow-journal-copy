# ProGuard / R8 rules for Dank Blossom

# ── Google Play Integrity API ─────────────────────────────────────────────────
# Keep all Play Integrity classes so that obfuscation doesn't break the
# runtime class-loading that the library does internally.
-keep class com.google.android.play.core.integrity.** { *; }
-keep interface com.google.android.play.core.integrity.** { *; }

# ── PlayIntegrityBridge (WebView JavaScript interface) ────────────────────────
# Methods annotated with @JavascriptInterface must not be renamed or removed;
# the JavaScript layer calls them by their original names through the bridge
# registered with WebView.addJavascriptInterface().
-keepclassmembers class com.dankblossom.PlayIntegrityBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Google Play Services Tasks ────────────────────────────────────────────────
-keep class com.google.android.gms.tasks.** { *; }
-keep interface com.google.android.gms.tasks.** { *; }
