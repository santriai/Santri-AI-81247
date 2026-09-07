package com.kitabkuningterjemahlengkap

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import android.widget.Toast
import com.google.firebase.messaging.FirebaseMessaging
import java.io.File
import java.io.FileOutputStream
import java.util.Locale

class WebAppInterface(
    private val activity: Activity,
    private val notificationHelper: NotificationHelper,
    private val onTriggerInterstitial: () -> Unit,
    private val onTriggerRewarded: () -> Unit,
    private val onLaunchBilling: (productId: String) -> Unit,
    private val onRequestGps: () -> Unit
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(activity, this)
    private var mediaPlayer: MediaPlayer? = null
    private var adhanMediaPlayer: MediaPlayer? = null
    private var isTtsInitialized = false
    private val prayerAdhanAudios = mutableMapOf<String, String>()

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("id", "ID"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setLanguage(Locale.getDefault())
            }
            isTtsInitialized = true
        }
    }

    // ==========================================
    // 1. DIALOG GPS OTOMATIS SAAT GANTI LOKASI
    // ==========================================
    @JavascriptInterface
    fun requestGpsEnable() {
        activity.runOnUiThread {
            onRequestGps()
        }
    }

    @JavascriptInterface
    fun openLocationSettings() {
        activity.startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
    }

    // ==========================================
    // 2. STATUS BAR ADZAN, NOTIFIKASI & FCM
    // ==========================================
    @JavascriptInterface
    fun showNotification(title: String, message: String, type: String) {
        activity.runOnUiThread {
            if (type.equals("adzan", ignoreCase = true) || type.equals("post_adzan", ignoreCase = true)) {
                notificationHelper.showAdzanNotification(title, message)
                playConfiguredAdhan(title)
            } else {
                // Tampilkan di status bar Android dengan channel FCM Broadcast
                notificationHelper.showFcmNotification(title, message, type)
            }
        }
    }

    @JavascriptInterface
    fun showNotificationWithAction(
        title: String,
        message: String,
        type: String,
        targetScreen: String,
        url: String?
    ) {
        activity.runOnUiThread {
            notificationHelper.showFcmNotification(
                title = title,
                message = message,
                type = type,
                targetScreen = targetScreen,
                targetUrl = url
            )
        }
    }

    @JavascriptInterface
    fun setAdhanAudio(prayerName: String, url: String, coverUrl: String?) {
        prayerAdhanAudios[prayerName.lowercase().trim()] = url
    }

    @JavascriptInterface
    fun schedulePrayerTimes(prayerTimesJson: String) {
        // Menerima sinkronisasi jadwal sholat dari React untuk notifikasi tepat waktu
    }

    // ==========================================
    // 3. PENGELOLA FCM (FIREBASE CLOUD MESSAGING)
    // ==========================================
    @JavascriptInterface
    fun getFcmToken() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful && task.result != null) {
                val token = task.result
                val prefs = activity.getSharedPreferences(SantriFirebaseMessagingService.PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit().putString(SantriFirebaseMessagingService.KEY_FCM_TOKEN, token).apply()
                (activity as? MainActivity)?.sendFcmTokenToWebView(token)
            } else {
                Log.w("WebAppInterface", "Gagal mendapatkan token FCM", task.exception)
            }
        }
    }

    @JavascriptInterface
    fun subscribeToTopic(topic: String) {
        FirebaseMessaging.getInstance().subscribeToTopic(topic.trim())
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d("WebAppInterface", "Berhasil berlangganan topik FCM: $topic")
                }
            }
    }

    @JavascriptInterface
    fun unsubscribeFromTopic(topic: String) {
        FirebaseMessaging.getInstance().unsubscribeFromTopic(topic.trim())
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d("WebAppInterface", "Berhasil berhenti langganan topik FCM: $topic")
                }
            }
    }

    @JavascriptInterface
    fun requestBatteryOptimizationExemption() {
        (activity as? MainActivity)?.requestBatteryOptimizationExemption()
    }

    private fun playConfiguredAdhan(prayerTitle: String) {
        try {
            val matchedKey = prayerAdhanAudios.keys.firstOrNull { prayerTitle.lowercase().contains(it) }
            val audioUrl = if (matchedKey != null) prayerAdhanAudios[matchedKey] else null

            if (!audioUrl.isNullOrBlank()) {
                adhanMediaPlayer?.release()
                adhanMediaPlayer = MediaPlayer().apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .build()
                    )
                    setDataSource(audioUrl)
                    prepareAsync()
                    setOnPreparedListener { start() }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ==========================================
    // 4. PEMUTAR AUDIO MUROTTAL & MP3
    // ==========================================
    @JavascriptInterface
    fun playQuranAudio(url: String, title: String, subtitle: String, coverUrl: String?) {
        activity.runOnUiThread {
            try {
                mediaPlayer?.release()
                mediaPlayer = MediaPlayer().apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .build()
                    )
                    setDataSource(url)
                    prepareAsync()
                    setOnPreparedListener {
                        start()
                        notificationHelper.updateMediaNotification(title, subtitle, true)
                    }
                    setOnCompletionListener {
                        notificationHelper.updateMediaNotification(title, subtitle, false)
                        activity.runOnUiThread {
                            activity.webView.evaluateJavascript(
                                "if (typeof window.onNativeAudioEnded === 'function') { window.onNativeAudioEnded(); }",
                                null
                            )
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun pauseQuranAudio() {
        activity.runOnUiThread {
            mediaPlayer?.pause()
            notificationHelper.updateMediaNotification("Santri AI Murottal", "Audio dijeda", false)
            activity.webView.evaluateJavascript(
                "if (typeof window.setNativePlaybackState === 'function') { window.setNativePlaybackState(false); }",
                null
            )
        }
    }

    @JavascriptInterface
    fun resumeQuranAudio() {
        activity.runOnUiThread {
            mediaPlayer?.start()
            notificationHelper.updateMediaNotification("Santri AI Murottal", "Sedang memutar audio", true)
            activity.webView.evaluateJavascript(
                "if (typeof window.setNativePlaybackState === 'function') { window.setNativePlaybackState(true); }",
                null
            )
        }
    }

    @JavascriptInterface
    fun stopQuranAudio() {
        activity.runOnUiThread {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
            notificationHelper.cancelMediaNotification()
        }
    }

    // ==========================================
    // 5. TEXT-TO-SPEECH (TTS) & AUDIO AI BASE64
    // ==========================================
    @JavascriptInterface
    fun speak(audioBase64: String?, fallbackText: String) {
        activity.runOnUiThread {
            if (!audioBase64.isNullOrBlank()) {
                playBase64Audio(audioBase64)
            } else if (isTtsInitialized && fallbackText.isNotBlank()) {
                tts?.speak(fallbackText, TextToSpeech.QUEUE_FLUSH, null, "SantriTtsId")
            }
        }
    }

    private fun playBase64Audio(base64Data: String) {
        try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.split(",")[1]
            } else {
                base64Data
            }
            val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            val tempAudioFile = File.createTempFile("tts_ai_", ".mp3", activity.cacheDir)
            FileOutputStream(tempAudioFile).use { it.write(decodedBytes) }

            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setDataSource(tempAudioFile.absolutePath)
                prepare()
                start()
                setOnCompletionListener {
                    tempAudioFile.delete()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun stopSpeaking() {
        activity.runOnUiThread {
            tts?.stop()
            mediaPlayer?.stop()
        }
    }

    // ==========================================
    // 6. DEEP LINK TOKO SANTRI
    // ==========================================
    @JavascriptInterface
    fun openTokopedia(itemId: String?, query: String?) {
        val uri = when {
            !itemId.isNullOrBlank() -> Uri.parse("tokopedia://product/$itemId")
            !query.isNullOrBlank() -> Uri.parse("tokopedia://search?q=${Uri.encode(query)}")
            else -> Uri.parse("tokopedia://home")
        }
        openCustomUriOrFallback(uri, "https://www.tokopedia.com")
    }

    @JavascriptInterface
    fun openShopee(itemId: String?, query: String?) {
        val uri = when {
            !itemId.isNullOrBlank() -> Uri.parse("shopee://product/$itemId")
            !query.isNullOrBlank() -> Uri.parse("shopee://search?keyword=${Uri.encode(query)}")
            else -> Uri.parse("shopee://home")
        }
        openCustomUriOrFallback(uri, "https://shopee.co.id")
    }

    @JavascriptInterface
    fun openWhatsApp(phone: String, message: String?) {
        val formattedPhone = phone.replace("+", "").replace("-", "").trim()
        val textParam = if (!message.isNullOrBlank()) "?text=${Uri.encode(message)}" else ""
        val uri = Uri.parse("whatsapp://send?phone=$formattedPhone$textParam")
        openCustomUriOrFallback(uri, "https://wa.me/$formattedPhone$textParam")
    }

    @JavascriptInterface
    fun openExternalUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            activity.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun openUrl(url: String) {
        openExternalUrl(url)
    }

    private fun openCustomUriOrFallback(customUri: Uri, fallbackWebUrl: String) {
        try {
            val appIntent = Intent(Intent.ACTION_VIEW, customUri)
            activity.startActivity(appIntent)
        } catch (e: Exception) {
            val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackWebUrl))
            activity.startActivity(webIntent)
        }
    }

    // ==========================================
    // 7. GOOGLE PLAY BILLING
    // ==========================================
    @JavascriptInterface
    fun launchBillingFlow(productId: String) {
        activity.runOnUiThread { onLaunchBilling(productId) }
    }

    // ==========================================
    // 8. IKLAN ADMOB
    // ==========================================
    @JavascriptInterface
    fun showInterstitialAd() {
        activity.runOnUiThread { onTriggerInterstitial() }
    }

    @JavascriptInterface
    fun showRewardedAd() {
        activity.runOnUiThread { onTriggerRewarded() }
    }

    @JavascriptInterface
    fun showRewardedInterstitialAd() {
        activity.runOnUiThread { onTriggerRewarded() }
    }

    // ==========================================
    // 9. BERKAS, GAMBAR & SHARE
    // ==========================================
    @JavascriptInterface
    fun shareText(title: String, message: String) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TITLE, title)
            putExtra(Intent.EXTRA_TEXT, message)
            type = "text/plain"
        }
        activity.startActivity(Intent.createChooser(sendIntent, title))
    }

    @JavascriptInterface
    fun saveTextToFile(filename: String, content: String) {
        (activity as? MainActivity)?.saveTextToFile(filename, content)
    }

    @JavascriptInterface
    fun shareImage(base64Image: String, filename: String) {
        (activity as? MainActivity)?.shareImage(base64Image, filename)
    }

    @JavascriptInterface
    fun openPlayStore() {
        try {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=${activity.packageName}")))
        } catch (e: Exception) {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=${activity.packageName}")))
        }
    }

    @JavascriptInterface
    fun exitApp() {
        activity.finishAffinity()
    }

    fun destroy() {
        tts?.stop()
        tts?.shutdown()
        mediaPlayer?.release()
        adhanMediaPlayer?.release()
        notificationHelper.cancelMediaNotification()
    }
}
