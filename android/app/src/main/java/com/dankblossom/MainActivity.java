package com.dankblossom;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.base6994e0c98fb6b9d1d4521dbd.app.BuildConfig;

/**
 * MainActivity
 *
 * Hosts the Dank Blossom React SPA in a WebView and handles Android App Link
 * intents for the dankblossom.app domain.
 *
 * Deep-link flow:
 *   1. Android verifies the app against /.well-known/assetlinks.json on the domain.
 *   2. A tap on an https://dankblossom.app URL fires an ACTION_VIEW intent.
 *   3. If the app is not yet running, onCreate() receives the intent and loads the URL.
 *   4. If the app is already in the foreground (singleTask), onNewIntent() is called
 *      and the WebView navigates to the requested URL.
 *
 * PlayIntegrityBridge is registered as a JavaScript interface so the React layer
 * can request Play Integrity tokens for device/app verification.
 */
public class MainActivity extends Activity {

    private static final String BASE_URL = "https://dankblossom.app";

    /**
     * Google Cloud project number linked to this app in the Play Console.
     * Injected at build time via BuildConfig from the
     * PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER environment variable.
     */
    private static final long CLOUD_PROJECT_NUMBER = BuildConfig.PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER;

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // Register the Play Integrity bridge so the React app can request tokens.
        webView.addJavascriptInterface(
                new PlayIntegrityBridge(this, webView, CLOUD_PROJECT_NUMBER),
                "AndroidPlayIntegrity");

        // Keep all navigation inside the WebView instead of opening the browser.
        webView.setWebViewClient(new WebViewClient());

        webView.loadUrl(resolveUrl(getIntent()));
    }

    /**
     * Called when the activity is already running and a new App Link intent arrives
     * (because the activity uses android:launchMode="singleTask").
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        webView.loadUrl(resolveUrl(intent));
    }

    /**
     * Returns the URL that should be loaded in the WebView.
     *
     * If the intent is an ACTION_VIEW for an https://dankblossom.app URL, that URL
     * is returned so the user lands on the exact page they tapped. Otherwise the
     * app's base URL is returned.
     *
     * Only https scheme URLs on dankblossom.app (or its subdomains) are accepted to
     * prevent open-redirect abuse.
     */
    private String resolveUrl(Intent intent) {
        if (intent != null
                && Intent.ACTION_VIEW.equals(intent.getAction())
                && intent.getData() != null) {
            Uri data = intent.getData();
            String host = data.getHost();
            if ("https".equals(data.getScheme())
                    && host != null
                    && (host.equals("dankblossom.app")
                        || host.endsWith(".dankblossom.app"))) {
                return data.toString();
            }
        }
        return BASE_URL;
    }

    /**
     * Navigate back within the WebView before closing the activity.
     *
     * onBackPressed() is deprecated in API 33+; suppress the warning because
     * this project targets a plain android.app.Activity without an AndroidX
     * Activity dependency, so OnBackPressedDispatcher/OnBackPressedCallback
     * (which require ComponentActivity) are not available here.
     */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
