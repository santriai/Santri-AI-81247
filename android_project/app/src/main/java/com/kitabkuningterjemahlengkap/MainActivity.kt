package com.kitabkuningterjemahlengkap

import android.Manifest
import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Message
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.android.billingclient.api.*
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*

class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {

    private lateinit var webView: WebView
    private var webAppInterface: WebAppInterface? = null
    private lateinit var notificationHelper: NotificationHelper

    // Google Play Billing
    private lateinit var billingClient: BillingClient

    // AdMob Ads (Sample Test ID untuk keamanan pengetesan)
    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private val TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712"
    private val TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917"

    // URL Web App Santri AI
    private val WEB_APP_URL = "https://ais-pre-aaeh7slgokaz4avmfjrawc-825769205276.asia-southeast1.run.app"

    // Launcher untuk Dialog Popup Menyalakan GPS Resmi Android
    private val gpsResolutionLauncher = registerForActivityResult(
        ActivityResultContracts.StartIntentSenderForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            webView.evaluateJavascript(
                "if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(function(){}); }",
                null
            )
        }
    }

    // Receiver untuk Aksi Tombol di Bilah Status Bar Pemutar Murottal
    private val mediaControlReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                NotificationHelper.ACTION_MEDIA_PLAY_PAUSE -> {
                    webView.evaluateJavascript(
                        "if (window.AppMediaControls && typeof window.AppMediaControls.togglePlay === 'function') { window.AppMediaControls.togglePlay(); }",
                        null
                    )
                }
                NotificationHelper.ACTION_MEDIA_NEXT -> {
                    webView.evaluateJavascript(
                        "if (window.AppMediaControls && typeof window.AppMediaControls.nextAyah === 'function') { window.AppMediaControls.nextAyah(); }",
                        null
                    )
                }
                NotificationHelper.ACTION_MEDIA_PREV -> {
                    webView.evaluateJavascript(
                        "if (window.AppMediaControls && typeof window.AppMediaControls.prevAyah === 'function') { window.AppMediaControls.prevAyah(); }",
                        null
                    )
                }
                NotificationHelper.ACTION_MEDIA_CLOSE -> {
                    notificationHelper.cancelMediaNotification()
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        notificationHelper = NotificationHelper(this)
        webView = findViewById(R.id.webView)

        // 1. Minta Izin Notifikasi & Lokasi
        requestRequiredPermissions()

        // 2. Daftarkan BroadcastReceiver untuk tombol bilah media
        registerMediaReceiver()

        // 3. Billing & AdMob
        setupBillingClient()
        MobileAds.initialize(this) {}
        loadInterstitialAd()
        loadRewardedAd()

        // 4. Setup WebView
        setupWebView()
        setupBackPressHandler()

        webView.loadUrl(WEB_APP_URL)
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION)
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toTypedArray(), 100)
        }
    }

    // ==========================================================
    // LOGIKA DIALOG POP-UP MENGAKTIFKAN GPS OTOMATIS
    // ==========================================================
    fun checkAndPromptGpsSettings() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000).build()
        val builder = LocationSettingsRequest.Builder().addLocationRequest(locationRequest)
        val client: SettingsClient = LocationServices.getSettingsClient(this)

        client.checkLocationSettings(builder.build())
            .addOnSuccessListener {
                // GPS sudah aktif
            }
            .addOnFailureListener { exception ->
                if (exception is ResolvableApiException) {
                    try {
                        val intentSenderRequest = IntentSenderRequest.Builder(exception.resolution).build()
                        gpsResolutionLauncher.launch(intentSenderRequest)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
    }

    private fun registerMediaReceiver() {
        val filter = IntentFilter().apply {
            addAction(NotificationHelper.ACTION_MEDIA_PLAY_PAUSE)
            addAction(NotificationHelper.ACTION_MEDIA_NEXT)
            addAction(NotificationHelper.ACTION_MEDIA_PREV)
            addAction(NotificationHelper.ACTION_MEDIA_CLOSE)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mediaControlReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(mediaControlReceiver, filter)
        }
    }

    // ==========================================
    // SETUP WEBVIEW & INTERFACE
    // ==========================================
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.setSupportMultipleWindows(true)
        settings.javaScriptCanOpenWindowsAutomatically = true

        // Izinkan akses Geolocation
        settings.setGeolocationEnabled(true)

        webAppInterface = WebAppInterface(
            activity = this,
            notificationHelper = notificationHelper,
            onTriggerInterstitial = { showInterstitial() },
            onTriggerRewarded = { showRewarded() },
            onLaunchBilling = { productId -> launchBilling(productId) },
            onRequestGps = { checkAndPromptGpsSettings() }
        )

        webView.addJavascriptInterface(webAppInterface!!, "AndroidNativeInterface")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (openExternalLink(url)) return true
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                val tempWebView = WebView(this@MainActivity)
                tempWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(v: WebView?, req: WebResourceRequest?): Boolean {
                        val targetUrl = req?.url?.toString() ?: return false
                        openExternalLink(targetUrl)
                        return true
                    }
                }
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = tempWebView
                resultMsg?.sendToTarget()
                return true
            }
        }
    }

    fun openExternalLink(url: String): Boolean {
        if (url.isBlank()) return false
        val uri = Uri.parse(url)

        if (url.startsWith("intent://")) {
            try {
                val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                if (intent != null) {
                    val info = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
                    if (info != null) {
                        startActivity(intent)
                        return true
                    } else {
                        val fallbackUrl = intent.getStringExtra("browser_fallback_url")
                        if (!fallbackUrl.isNullOrEmpty()) {
                            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)))
                            return true
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return true
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                return true
            } catch (e: Exception) {
                Toast.makeText(this, "Aplikasi pendukung belum terinstal.", Toast.LENGTH_SHORT).show()
                return true
            }
        }

        val host = uri.host?.lowercase() ?: ""
        val isInternalApp = host.contains("ais-pre-aaeh7slgokaz4avmfjrawc") || host.contains("run.app")

        if (!isInternalApp) {
            try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                return true
            } catch (e: Exception) {
                return false
            }
        }
        return false
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript(
                    "(function() { return !!(window.handleAndroidBackPress && window.handleAndroidBackPress()); })();"
                ) { result ->
                    val handledByReact = result?.trim()?.equals("true", ignoreCase = true) == true
                    if (!handledByReact) {
                        if (webView.canGoBack()) {
                            webView.goBack()
                        } else {
                            finish()
                        }
                    }
                }
            }
        })
    }

    // ==========================================
    // BILLING & ADMOB
    // ==========================================
    private fun setupBillingClient() {
        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {}
            override fun onBillingServiceDisconnected() {}
        })
    }

    private fun launchBilling(productId: String) {
        if (!billingClient.isReady) {
            billingClient.startConnection(object : BillingClientStateListener {
                override fun onBillingSetupFinished(result: BillingResult) {
                    if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                        queryAndLaunchProduct(productId)
                    }
                }
                override fun onBillingServiceDisconnected() {}
            })
            return
        }
        queryAndLaunchProduct(productId)
    }

    private fun queryAndLaunchProduct(productId: String) {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )
        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
                val flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(
                        listOf(
                            BillingFlowParams.ProductDetailsParams.newBuilder()
                                .setProductDetails(productDetailsList[0])
                                .build()
                        )
                    ).build()
                billingClient.launchBillingFlow(this, flowParams)
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                val consumeParams = ConsumeParams.newBuilder().setPurchaseToken(purchase.purchaseToken).build()
                billingClient.consumeAsync(consumeParams) { _, _ ->
                    val purchasedId = purchase.products.firstOrNull() ?: ""
                    runOnUiThread {
                        webView.evaluateJavascript("if (typeof window.onPurchaseSuccess === 'function') { window.onPurchaseSuccess('$purchasedId'); }", null)
                    }
                }
            }
        }
    }

    private fun loadInterstitialAd() {
        InterstitialAd.load(this, TEST_INTERSTITIAL_ID, AdRequest.Builder().build(), object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) { interstitialAd = ad }
            override fun onAdFailedToLoad(error: LoadAdError) { interstitialAd = null }
        })
    }

    private fun showInterstitial() {
        interstitialAd?.let {
            it.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() { interstitialAd = null; loadInterstitialAd() }
                override fun onAdFailedToShowFullScreenContent(error: AdError) { interstitialAd = null; loadInterstitialAd() }
            }
            it.show(this)
        } ?: loadInterstitialAd()
    }

    private fun loadRewardedAd() {
        RewardedAd.load(this, TEST_REWARDED_ID, AdRequest.Builder().build(), object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) { rewardedAd = ad }
            override fun onAdFailedToLoad(error: LoadAdError) { rewardedAd = null }
        })
    }

    private fun showRewarded() {
        rewardedAd?.let {
            it.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() { rewardedAd = null; loadRewardedAd() }
                override fun onAdFailedToShowFullScreenContent(error: AdError) { rewardedAd = null; loadRewardedAd() }
            }
            it.show(this) { _ ->
                runOnUiThread {
                    webView.evaluateJavascript("if (typeof window.onRewardGranted === 'function') { window.onRewardGranted(); }", null)
                }
            }
        } ?: loadRewardedAd()
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(mediaControlReceiver)
        webAppInterface?.destroy()
        if (::billingClient.isInitialized) billingClient.endConnection()
    }
}
