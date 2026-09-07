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
import android.os.Environment
import android.os.Message
import android.os.PowerManager
import android.provider.MediaStore
import android.provider.Settings
import android.webkit.*
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.android.billingclient.api.*
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.google.android.gms.common.api.ResolvableApiException
import com.google.android.gms.location.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {

    companion object {
        var activeInstance: MainActivity? = null
    }

    private lateinit var webView: WebView
    private var webAppInterface: WebAppInterface? = null
    private lateinit var notificationHelper: NotificationHelper

    // Google Play Billing
    private lateinit var billingClient: BillingClient

    // AdMob Ads (Sample Test ID untuk pengujian aman)
    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private val TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712"
    private val TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917"

    // URL Web App Santri AI
    private val WEB_APP_URL = "https://ais-pre-aaeh7slgokaz4avmfjrawc-825769205276.asia-southeast1.run.app"

    // File Chooser untuk Kamera & Scan Kitab
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var currentPhotoPath: String? = null
    private var cameraImageUri: Uri? = null

    // Pending navigasi dari klik notifikasi FCM / status bar
    private var pendingTargetScreen: String? = null
    private var pendingTargetUrl: String? = null
    private var isWebViewPageLoaded = false

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null
        if (result.resultCode == RESULT_OK) {
            val dataString = result.data?.dataString
            if (dataString != null) {
                results = arrayOf(Uri.parse(dataString))
            } else if (cameraImageUri != null) {
                results = arrayOf(cameraImageUri!!)
            }
        }
        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

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
                        "if (window.AppMediaControls && typeof window.AppMediaControls.playNext === 'function') { window.AppMediaControls.playNext(); }",
                        null
                    )
                }
                NotificationHelper.ACTION_MEDIA_PREV -> {
                    webView.evaluateJavascript(
                        "if (window.AppMediaControls && typeof window.AppMediaControls.playPrev === 'function') { window.AppMediaControls.playPrev(); }",
                        null
                    )
                }
                NotificationHelper.ACTION_MEDIA_CLOSE -> {
                    webAppInterface?.stopQuranAudio()
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        activeInstance = this

        notificationHelper = NotificationHelper(this)

        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)

        setupMediaReceiver()
        initBilling()
        initAdMob()
        setupWebView()

        // Tangani navigasi jika aplikasi dibuka dari notifikasi status bar / FCM
        handleIntentNavigation(intent)

        setupBackPressHandler()
        checkAndRequestPermissions()

        webView.loadUrl(WEB_APP_URL)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntentNavigation(intent)
    }

    private fun handleIntentNavigation(intent: Intent?) {
        val targetScreen = intent?.getStringExtra("targetScreen")
        val targetUrl = intent?.getStringExtra("targetUrl")

        if (!targetScreen.isNullOrEmpty() || !targetUrl.isNullOrEmpty()) {
            if (isWebViewPageLoaded) {
                val safeScreen = (targetScreen ?: "").replace("'", "\\'")
                val safeUrl = (targetUrl ?: "").replace("'", "\\'")
                val js = "if (window.handleFcmNavigation) { window.handleFcmNavigation('$safeScreen', '$safeUrl'); }"
                webView.evaluateJavascript(js, null)
            } else {
                pendingTargetScreen = targetScreen
                pendingTargetUrl = targetUrl
            }
        }
    }

    fun sendFcmTokenToWebView(token: String) {
        runOnUiThread {
            val js = "if (window.onFcmTokenReceived) { window.onFcmTokenReceived('$token'); }"
            webView.evaluateJavascript(js, null)
        }
    }

    fun requestBatteryOptimizationExemption() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
                if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun saveTextToFile(filename: String, content: String) {
        try {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(downloadsDir, filename)
            file.writeText(content)
            Toast.makeText(this, "Tersimpan di Unduhan: $filename", Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Gagal menyimpan berkas", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareImage(base64Image: String, filename: String) {
        try {
            val cleanBase64 = if (base64Image.contains(",")) base64Image.split(",")[1] else base64Image
            val imageBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
            val cachePath = File(cacheDir, "images")
            cachePath.mkdirs()
            val file = File(cachePath, filename)
            file.writeBytes(imageBytes)
            val contentUri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(shareIntent, "Bagikan Gambar"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    private fun setupMediaReceiver() {
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

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webAppInterface = WebAppInterface(
            activity = this,
            notificationHelper = notificationHelper,
            onTriggerInterstitial = { showInterstitial() },
            onTriggerRewarded = { showRewarded() },
            onLaunchBilling = { productId -> launchBilling(productId) },
            onRequestGps = { checkLocationSettingsAndPrompt() }
        )

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true
            allowContentAccess = true
            setGeolocationEnabled(true)
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            userAgentString = "$userAgentString SantriAINativeApp/1.0"
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
        }

        webView.addJavascriptInterface(webAppInterface!!, "AndroidNativeInterface")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                if (url.startsWith("market://") || url.startsWith("tokopedia://") ||
                    url.startsWith("shopee://") || url.startsWith("whatsapp://") ||
                    url.startsWith("tel:") || url.startsWith("mailto:")
                ) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: Exception) {
                        return false
                    }
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isWebViewPageLoaded = true

                // 1. Eksekusi pending navigasi FCM jika ada
                if (!pendingTargetScreen.isNullOrEmpty() || !pendingTargetUrl.isNullOrEmpty()) {
                    val safeScreen = (pendingTargetScreen ?: "").replace("'", "\\'")
                    val safeUrl = (pendingTargetUrl ?: "").replace("'", "\\'")
                    val js = "if (window.handleFcmNavigation) { window.handleFcmNavigation('$safeScreen', '$safeUrl'); }"
                    webView.evaluateJavascript(js, null)
                    pendingTargetScreen = null
                    pendingTargetUrl = null
                }

                // 2. Berikan token FCM tersimpan ke Website
                val prefs = getSharedPreferences(SantriFirebaseMessagingService.PREFS_NAME, Context.MODE_PRIVATE)
                val cachedToken = prefs.getString(SantriFirebaseMessagingService.KEY_FCM_TOKEN, null)
                if (!cachedToken.isNullOrEmpty()) {
                    sendFcmTokenToWebView(cachedToken)
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                val photoFile: File? = try {
                    createImageFile()
                } catch (ex: Exception) {
                    null
                }

                if (photoFile != null) {
                    cameraImageUri = FileProvider.getUriForFile(
                        this@MainActivity,
                        "$packageName.fileprovider",
                        photoFile
                    )
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                }

                val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf"))
                }

                val intentArray: Array<Intent> = if (photoFile != null) {
                    arrayOf(takePictureIntent)
                } else {
                    emptyArray()
                }

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                    putExtra(Intent.EXTRA_TITLE, "Pilih Foto Kitab atau Buka Kamera")
                    putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                }

                fileChooserLauncher.launch(chooserIntent)
                return true
            }

            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                val newWebView = WebView(this@MainActivity)
                newWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                        val url = request?.url?.toString() ?: return false
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    }
                }
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                transport?.webView = newWebView
                resultMsg?.sendToTarget()
                return true
            }
        }
    }

    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir: File? = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JPEG_${timeStamp}_", ".jpg", storageDir).apply {
            currentPhotoPath = absolutePath
        }
    }

    private fun checkLocationSettingsAndPrompt() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000).build()
        val builder = LocationSettingsRequest.Builder().addLocationRequest(locationRequest)
        val client: SettingsClient = LocationServices.getSettingsClient(this)
        val task = client.checkLocationSettings(builder.build())

        task.addOnFailureListener { exception ->
            if (exception is ResolvableApiException) {
                try {
                    val intentSenderRequest = IntentSenderRequest.Builder(exception.resolution).build()
                    gpsResolutionLauncher.launch(intentSenderRequest)
                } catch (sendEx: Exception) {
                    startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
                }
            } else {
                startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), 101)
        }
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun initBilling() {
        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {}
            override fun onBillingServiceDisconnected() {}
        })
    }

    private fun initAdMob() {
        MobileAds.initialize(this) {}
        loadInterstitialAd()
        loadRewardedAd()
    }

    private fun launchBilling(productId: String) {
        if (!billingClient.isReady) return

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
        if (activeInstance == this) activeInstance = null
        try {
            unregisterReceiver(mediaControlReceiver)
        } catch (e: Exception) {}
        webAppInterface?.destroy()
        if (::billingClient.isInitialized) billingClient.endConnection()
    }
}
