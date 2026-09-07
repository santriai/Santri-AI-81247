package com.kitabkuningterjemahlengkap

import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class SantriFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "SantriFCM"
        const val PREFS_NAME = "santri_prefs"
        const val KEY_FCM_TOKEN = "fcm_token"
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Token FCM Baru Diterima: $token")

        // 1. Simpan token ke SharedPreferences agar selalu dapat dibaca oleh WebView saat dimuat
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()

        // 2. Berikan token ke antarmuka Website (AI Studio / React) jika aplikasi sedang aktif
        MainActivity.activeInstance?.sendFcmTokenToWebView(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Pesan FCM Diterima dari: ${remoteMessage.from}")

        // Ekstraksi Konten Pesan (baik format Notification maupun Data payload)
        val data = remoteMessage.data
        val notif = remoteMessage.notification

        val title = notif?.title ?: data["title"] ?: "Santri AI"
        val body = notif?.body ?: data["body"] ?: data["message"] ?: "Ada pemberitahuan baru di Santri AI"
        val type = data["type"] ?: "broadcast"
        val targetScreen = data["targetScreen"] ?: data["screen"] ?: ""
        val targetUrl = data["targetUrl"] ?: data["url"] ?: ""

        val notificationHelper = NotificationHelper(applicationContext)

        if (type.equals("adzan", ignoreCase = true)) {
            // Eksekusi Notifikasi Adzan Masuk Sholat
            notificationHelper.showAdzanNotification(title, body)
        } else {
            // Eksekusi Notifikasi Status Bar Push FCM / Kajian / Pengumuman
            notificationHelper.showFcmNotification(
                title = title,
                message = body,
                type = type,
                targetScreen = targetScreen.ifEmpty { null },
                targetUrl = targetUrl.ifEmpty { null }
            )
        }
    }
}
