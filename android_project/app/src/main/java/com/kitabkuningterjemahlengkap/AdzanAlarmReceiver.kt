package com.kitabkuningterjemahlengkap

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.util.Log

/**
 * Receiver yang dibangunkan oleh AlarmManager tepat pada waktu sholat
 * Memutar MP3 adzan secara OFFLINE dari penyimpanan internal lokal
 */
class AdzanAlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AdzanAlarmReceiver"
        var activeAdzanPlayer: MediaPlayer? = null

        fun stopAdzanSound(context: Context) {
            try {
                activeAdzanPlayer?.let { player ->
                    if (player.isPlaying) {
                        player.stop()
                    }
                    player.release()
                }
                activeAdzanPlayer = null
                NotificationHelper(context).dismissAdzanNotification()
            } catch (e: Exception) {
                Log.e(TAG, "Error saat menghentikan suara adzan: ${e.message}")
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("TITLE") ?: "Waktu Sholat"
        val message = intent.getStringExtra("MESSAGE") ?: "Telah masuk waktu sholat"
        val prayerName = intent.getStringExtra("PRAYER_NAME") ?: "Sholat"
        val soundKey = intent.getStringExtra("SOUND_KEY") ?: prayerName
        val audioUrl = intent.getStringExtra("AUDIO_URL")

        Log.d(TAG, "Menerima alarm sholat untuk: $prayerName (SoundKey: $soundKey)")

        // 1. Tampilkan notifikasi adzan di Status Bar dengan tombol "HENTIKAN ADZAN"
        val notificationHelper = NotificationHelper(context)
        notificationHelper.showAdzanNotification(title, message, prayerName)

        // 2. Putar Suara Adzan secara OFFLINE dari penyimpanan internal
        playOfflineAdzan(context, soundKey, prayerName, audioUrl)
    }

    private fun playOfflineAdzan(
        context: Context,
        soundKey: String,
        prayerName: String,
        fallbackUrl: String?
    ) {
        try {
            stopAdzanSound(context)

            // Cek file audio offline di folder lokal:
            val localAudioFile = AdzanAudioStorageManager.getLocalAudioFile(context, soundKey)
                ?: AdzanAudioStorageManager.getLocalAudioFile(context, prayerName)
                ?: AdzanAudioStorageManager.getLocalAudioFile(context, "default")

            activeAdzanPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )

                if (localAudioFile != null && localAudioFile.exists()) {
                    // 100% OFFLINE: Putar dari file fisik di penyimpanan internal HP
                    Log.d(TAG, "Memutar adzan OFFLINE dari storage: ${localAudioFile.absolutePath}")
                    setDataSource(localAudioFile.absolutePath)
                } else if (!fallbackUrl.isNullOrBlank() && fallbackUrl.startsWith("http")) {
                    // Fallback streaming hanya jika file lokal belum sempat terdownload
                    Log.d(TAG, "File lokal belum siap, fallback streaming dari URL")
                    setDataSource(fallbackUrl)
                } else {
                    Log.w(TAG, "Tidak ada file offline maupun URL streaming untuk $prayerName")
                    return
                }

                prepareAsync()
                setOnPreparedListener {
                    start()
                }
                setOnCompletionListener {
                    stopAdzanSound(context)
                }
                setOnErrorListener { _, what, extra ->
                    Log.e(TAG, "MediaPlayer error: what=$what, extra=$extra")
                    stopAdzanSound(context)
                    true
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Gagal memutar audio adzan: ${e.message}")
        }
    }
}
