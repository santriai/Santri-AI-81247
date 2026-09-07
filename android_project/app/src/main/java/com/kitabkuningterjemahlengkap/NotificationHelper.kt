package com.kitabkuningterjemahlengkap

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle

class NotificationHelper(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val CHANNEL_ADZAN_ID = "channel_adzan_santri"
        const val CHANNEL_MEDIA_ID = "channel_media_santri"
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
            // Channel 1: Notifikasi Adzan & Waktu Sholat (High Priority / Pop-up)
            val adzanChannel = NotificationChannel(
                CHANNEL_ADZAN_ID,
                "Waktu Sholat & Adzan",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Pemberitahuan waktu sholat dan pengingat adzan"
                enableVibration(true)
            }

            // Channel 2: Kontrol Pemutar Audio Murottal (Low Priority agar tidak bersuara saat ganti lagu)
            val mediaChannel = NotificationChannel(
                CHANNEL_MEDIA_ID,
                "Pemutar Audio Al-Qur'an",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Bilah kontrol pemutar murottal di status bar"
                setShowBadge(false)
            }

            notificationManager.createNotificationChannel(adzanChannel)
            notificationManager.createNotificationChannel(mediaChannel)
        }
    }

    // ==========================================================
    // 1. NOTIFIKASI STATUSBAR ADZAN
    // ==========================================================
    fun showAdzanNotification(title: String, message: String) {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
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
    // 2. NOTIFIKASI STATUSBAR PEMUTAR MEDIA (MUROTTAL)
    // ==========================================================
    fun updateMediaNotification(title: String, subtitle: String, isPlaying: Boolean) {
        val openAppIntent = Intent(context, MainActivity::class.java)
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
