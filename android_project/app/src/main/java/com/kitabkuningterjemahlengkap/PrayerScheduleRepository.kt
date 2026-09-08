package com.kitabkuningterjemahlengkap

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * Manajer Penyimpanan dan Penjadwalan Mandiri Jadwal Sholat Android.
 * Menyimpan data jadwal multi-hari di SharedPreferences sehingga alarm adzan
 * tetap berjalan setiap hari meskipun pengguna TIDAK PERNAH membuka aplikasi lagi.
 */
object PrayerScheduleRepository {
    private const val TAG = "PrayerScheduleRepo"
    private const val PREFS_NAME = "santriai_prayer_schedule_prefs"
    private const val KEY_SCHEDULE_DATA = "saved_schedule_json"
    private const val KEY_LOCATION_KEY = "current_location_key"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Simpan jadwal multi-hari dari Web.
     * Jika locationKey berbeda (pengguna ganti lokasi), jadwal lama otomatis diganti total.
     */
    fun saveMultiDaySchedule(context: Context, scheduleJson: String, locationKey: String = "") {
        try {
            getPrefs(context).edit().apply {
                putString(KEY_SCHEDULE_DATA, scheduleJson)
                if (locationKey.isNotBlank()) {
                    putString(KEY_LOCATION_KEY, locationKey)
                }
                apply()
            }
            Log.d(TAG, "Berhasil menyimpan jadwal multi-hari (Lokasi: $locationKey)")
            // Jadwalkan alarm aktif pertama
            rescheduleUpcomingAlarms(context)
        } catch (e: Exception) {
            Log.e(TAG, "Gagal menyimpan jadwal sholat: ${e.message}")
        }
    }

    /**
     * Ambil item-item sholat yang akan datang dan jadwalkan ke AlarmManager
     */
    fun rescheduleUpcomingAlarms(context: Context) {
        val jsonStr = getPrefs(context).getString(KEY_SCHEDULE_DATA, null) ?: return
        try {
            val jsonArray = JSONArray(jsonStr)
            val now = System.currentTimeMillis()
            val notificationHelper = NotificationHelper(context)

            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val calendar = Calendar.getInstance()

            var scheduledCount = 0

            for (i in 0 until jsonArray.length()) {
                val item = jsonArray.getJSONObject(i)
                val prayerName = item.optString("name", "Sholat")
                val timeStr = item.optString("time", "").replace(Regex("\\s*\\(.*?\\)\\s*"), "").trim()
                val dateStr = item.optString("date", "") // format: YYYY-MM-DD
                val soundKey = item.optString("soundKey", prayerName).ifBlank { prayerName }
                val audioUrl = item.optString("audioUrl", "")
                val title = item.optString("title", "Waktu $prayerName")
                val message = item.optString("message", "Telah masuk waktu $prayerName")

                // Unduh audio secara offline jika belum tersimpan
                if (audioUrl.isNotBlank() && audioUrl.startsWith("http")) {
                    AdzanAudioStorageManager.downloadAndSaveAudioAsync(context, soundKey, audioUrl)
                }

                if (!timeStr.contains(":")) continue

                var triggerMillis = 0L

                if (dateStr.isNotBlank()) {
                    // Ada tanggal spesifik (misal jadwal 30 hari)
                    val fullDateTime = "$dateStr $timeStr"
                    try {
                        val parsedDate = dateFormat.parse(fullDateTime)
                        if (parsedDate != null) {
                            triggerMillis = parsedDate.time
                        }
                    } catch (pe: Exception) {
                        pe.printStackTrace()
                    }
                }

                // Fallback jika tidak ada dateStr spesifik
                if (triggerMillis <= 0L) {
                    val parts = timeStr.split(":")
                    val h = parts[0].trim().toIntOrNull() ?: continue
                    val m = parts[1].trim().toIntOrNull() ?: continue

                    calendar.timeInMillis = now
                    calendar.set(Calendar.HOUR_OF_DAY, h)
                    calendar.set(Calendar.MINUTE, m)
                    calendar.set(Calendar.SECOND, 0)
                    calendar.set(Calendar.MILLISECOND, 0)

                    if (calendar.timeInMillis <= now) {
                        calendar.add(Calendar.DAY_OF_YEAR, 1)
                    }
                    triggerMillis = calendar.timeInMillis
                }

                // Pasang alarm HANYA untuk waktu yang akan datang
                if (triggerMillis > now) {
                    // Unique RequestCode agar tidak saling menimpa
                    val requestCode = 4000 + (i % 500)
                    notificationHelper.schedulePrayerAlarm(
                        requestCode = requestCode,
                        triggerAtMillis = triggerMillis,
                        title = title,
                        message = message,
                        prayerName = prayerName,
                        soundKey = soundKey,
                        audioUrl = audioUrl
                    )
                    scheduledCount++
                }
            }

            Log.d(TAG, "Selesai menjadwalkan $scheduledCount alarm sholat mendatang.")
        } catch (e: Exception) {
            Log.e(TAG, "Error saat menjadwalkan ulang alarm: ${e.message}")
        }
    }
}
