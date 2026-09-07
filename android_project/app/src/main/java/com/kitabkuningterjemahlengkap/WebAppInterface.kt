package com.kitabkuningterjemahlengkap

import android.app.Activity
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
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
    private var isTtsInitialized = false

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
    // 2. STATUS BAR ADZAN & NOTIFIKASI
    // ==========================================
    @JavascriptInterface
    fun showNotification(title: String, message: String, type: String) {
        activity.runOnUiThread {
            if (type.equals("adzan", ignoreCase = true) || type.equals("post_adzan", ignoreCase = true)) {
                notificationHelper.showAdzanNotification(title, message)
            } else {
                Toast.makeText(activity, "$title: $message", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // ==========================================
    // 3. STATUS BAR KONTROL MEDIA PEMUTAR
    // ==========================================
    @JavascriptInterface
    fun updateMediaNotification(title: String, subtitle: String, isPlaying: Boolean) {
        activity.runOnUiThread {
            notificationHelper.updateMediaNotification(title, subtitle, isPlaying)
        }
    }

    @JavascriptInterface
    fun cancelMediaNotification() {
        activity.runOnUiThread {
            notificationHelper.cancelMediaNotification()
        }
    }

    // ==========================================
    // 4. LINK EKSTERNAL & TOKO SANTRI (SHOPEE, TOKOPEDIA, WA)
    // ==========================================
    @JavascriptInterface
    fun openExternalUrl(url: String) {
        activity.runOnUiThread {
            (activity as? MainActivity)?.openExternalLink(url)
        }
    }

    @JavascriptInterface
    fun openUrl(url: String) {
        openExternalUrl(url)
    }

    // ==========================================
    // 5. GOOGLE PLAY BILLING
    // ==========================================
    @JavascriptInterface
    fun launchBillingFlow(productId: String) {
        activity.runOnUiThread { onLaunchBilling(productId) }
    }

    // ==========================================
    // 6. TEXT-TO-SPEECH (TTS) & AUDIO BASE64
    // ==========================================
    @JavascriptInterface
    fun speak(audioBase64: String, text: String) {
        activity.runOnUiThread {
            try {
                if (audioBase64.isNotBlank()) {
                    playBase64Audio(audioBase64)
                    return@runOnUiThread
                }
                if (text.isNotBlank() && isTtsInitialized) {
                    tts?.stop()
                    val params = Bundle()
                    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "SantriAiTTS")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun playBase64Audio(base64Data: String) {
        try {
            val cleanBase64 = if (base64Data.contains(",")) base64Data.substringAfter(",") else base64Data
            val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            val tempAudioFile = File.createTempFile("tts_audio", ".mp3", activity.cacheDir)
            FileOutputStream(tempAudioFile).use { it.write(decodedBytes) }

            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                setDataSource(tempAudioFile.absolutePath)
                prepare()
                start()
                setOnCompletionListener { tempAudioFile.delete() }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // ==========================================
    // 7. QUR'AN AUDIO CONTROLS (NATIVE)
    // ==========================================
    @JavascriptInterface
    fun playQuranAudio(url: String, title: String, subtitle: String, coverUrl: String?) {
        activity.runOnUiThread {
            try {
                mediaPlayer?.release()
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(url)
                    prepareAsync()
                    setOnPreparedListener { start() }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @JavascriptInterface
    fun pauseQuranAudio() {
        activity.runOnUiThread {
            if (mediaPlayer?.isPlaying == true) mediaPlayer?.pause()
        }
    }

    @JavascriptInterface
    fun resumeQuranAudio() {
        activity.runOnUiThread {
            mediaPlayer?.start()
        }
    }

    @JavascriptInterface
    fun stopQuranAudio() {
        activity.runOnUiThread {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        }
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
    // 9. SHARE & SISTEM
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
        notificationHelper.cancelMediaNotification()
    }
}
