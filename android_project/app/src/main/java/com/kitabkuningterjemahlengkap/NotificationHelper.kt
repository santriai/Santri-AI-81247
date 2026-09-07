package com.kitabkuningterjemahlengkap

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle

class NotificationHelper(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val CHANNEL_ADZAN_ID = "channel_adzan_santri"
        const val CHANNEL_MEDIA_ID = "channel_media_santri"
        const val CHANNEL_FCM_BROADCAST = "channel_fcm_santri"

        const val ADZAN_NOTIF_ID = 1001
        const val MEDIA_NOTIF_ID = 1002

        const val ACTION_MEDIA_PLAY_PAUSE = "com.kitabkuningterjemahlengkap.ACTION_PLAY_PAUSE"
        const val ACTION_MEDIA_PREV = "com.kitabkuningterjemahlengkap.ACTION_PREV"
        const val ACTION_MEDIA_NEXT = "com.kitabkuningterjemahlengkap.ACTION_NEXT"
        const val ACTION_MEDIA_CLOSE = "com.kitabkuningterjemahlengkap.ACTION_CLOSE"
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()

            // Channel 1: Notifikasi Adzan & Waktu Sholat (Prioritas Tinggi / Pop-up)
            val adzanChannel = NotificationChannel(
                CHANNEL_ADZAN_ID,
                "Waktu Sholat & Adzan",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Pemberitahuan waktu sholat dan pengingat adzan"
                enableVibration(true)
                setSound(defaultSoundUri, audioAttributes)
            }

            // Channel 2: Notifikasi Push FCM & Pengumuman Santri (Prioritas Tinggi)
            val fcmChannel = NotificationChannel(
                CHANNEL_FCM_BROADCAST,
                "Pengumuman & Kajian Santri",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Pesan siaran, kajian harian, dan notifikasi FCM dari pengurus"
                enableVibration(true)
                setSound(defaultSoundUri, audioAttributes)
            }

            // Channel 3: Kontrol Pemutar Audio Murottal (Prioritas Rendah agar tenang di status bar)
            val mediaChannel = NotificationChannel(
                CHANNEL_MEDIA_ID,
                "Pemutar Audio Al-Qur'an",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Bilah kontrol pemutar murottal di status bar"
                setShowBadge(false)
            }

            notificationManager.createNotificationChannel(adzanChannel)
            notificationManager.createNotificationChannel(fcmChannel)
            notificationManager.createNotificationChannel(mediaChannel)
        }
    }

    // ==========================================================
    // 1. NOTIFIKASI STATUS BAR FCM & BROADCAST PUSH NOTIFICATION
    // ==========================================================
    fun showFcmNotification(
        title: String,
        message: String,
        type: String? = "broadcast",
        targetScreen: String? = null,
        targetUrl: String? = null
    ) {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("targetScreen", targetScreen ?: "")
            putExtra("targetUrl", targetUrl ?: "")
            putExtra("notificationType", type ?: "broadcast")
        }

        val requestCode = (System.currentTimeMillis() % 100000).toInt()
        val pendingIntent = PendingIntent.getActivity(
            context,
            requestCode,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_FCM_BROADCAST)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(requestCode, notification)
    }

    // ==========================================================
    // 2. NOTIFIKASI STATUS BAR ADZAN & WAKTU SHOLAT
    // ==========================================================
    fun showAdzanNotification(title: String, message: String) {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("targetScreen", "jadwal-sholat")
            putExtra("notificationType", "adzan")
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ADZAN_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(ADZAN_NOTIF_ID, notification)
    }

    // ==========================================================
    // 3. NOTIFIKASI STATUS BAR PEMUTAR MEDIA (MUROTTAL)
    // ==========================================================
    fun updateMediaNotification(title: String, subtitle: String, isPlaying: Boolean) {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            putExtra("targetScreen", "quran")
        }
        val contentPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE
        )

        val prevPending = PendingIntent.getBroadcast(
            context, 1,
            Intent(ACTION_MEDIA_PREV).setPackage(context.packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPausePending = PendingIntent.getBroadcast(
            context, 2,
            Intent(ACTION_MEDIA_PLAY_PAUSE).setPackage(context.packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val nextPending = PendingIntent.getBroadcast(
            context, 3,
            Intent(ACTION_MEDIA_NEXT).setPackage(context.packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val closePending = PendingIntent.getBroadcast(
            context, 4,
            Intent(ACTION_MEDIA_CLOSE).setPackage(context.packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPauseIcon = if (isPlaying) {
            android.R.drawable.ic_media_pause
        } else {
            android.R.drawable.ic_media_play
        }
        val playPauseText = if (isPlaying) "Jeda" else "Putar"

        val notification = NotificationCompat.Builder(context, CHANNEL_MEDIA_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(subtitle)
            .setContentIntent(contentPendingIntent)
            .setOngoing(isPlaying)
            .addAction(android.R.drawable.ic_media_previous, "Sebelumnya", prevPending)
            .addAction(playPauseIcon, playPauseText, playPausePending)
            .addAction(android.R.drawable.ic_media_next, "Selanjutnya", nextPending)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Tutup", closePending)
            .setStyle(
                MediaStyle()
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .build()

        notificationManager.notify(MEDIA_NOTIF_ID, notification)
    }

    fun cancelMediaNotification() {
        notificationManager.cancel(MEDIA_NOTIF_ID)
    }
}
