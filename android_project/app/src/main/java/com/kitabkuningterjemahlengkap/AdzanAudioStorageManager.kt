package com.kitabkuningterjemahlengkap

import android.content.Context
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/**
 * Manajer Pengunduhan dan Penyimpanan File Audio Adzan Offline
 * Menyimpan file MP3 ke penyimpanan internal aplikasi (context.filesDir/adzan_sounds/)
 */
object AdzanAudioStorageManager {
    private const val TAG = "AdzanStorageManager"
    private const val FOLDER_NAME = "adzan_sounds"

    /**
     * Mendapatkan folder khusus penyimpanan MP3 adzan di memori internal
     */
    fun getAdzanFolder(context: Context): File {
        val dir = File(context.filesDir, FOLDER_NAME)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    /**
     * Mendapatkan file lokal jika sudah ada dan ukurannya valid (> 5KB)
     */
    fun getLocalAudioFile(context: Context, soundKey: String): File? {
        val cleanKey = sanitizeKey(soundKey)
        val file = File(getAdzanFolder(context), "$cleanKey.mp3")
        return if (file.exists() && file.length() > 5000) file else null
    }

    /**
     * Unduh file audio MP3 secara asynchronous dan simpan ke memori internal lokal
     */
    fun downloadAndSaveAudioAsync(
        context: Context,
        soundKey: String,
        audioUrl: String,
        onComplete: ((Boolean, File?) -> Unit)? = null
    ) {
        if (audioUrl.isBlank() || !audioUrl.startsWith("http")) {
            onComplete?.invoke(false, null)
            return
        }

        val cleanKey = sanitizeKey(soundKey)
        val targetFile = File(getAdzanFolder(context), "$cleanKey.mp3")

        // Jika file sudah tersimpan lengkap sebelumnya, tidak perlu download ulang
        if (targetFile.exists() && targetFile.length() > 5000) {
            Log.d(TAG, "Audio adzan untuk [$cleanKey] sudah ada secara offline (${targetFile.length()} bytes)")
            onComplete?.invoke(true, targetFile)
            return
        }

        thread(start = true, name = "DownloadAdzan-$cleanKey") {
            var connection: HttpURLConnection? = null
            var success = false
            val tempFile = File(getAdzanFolder(context), "$cleanKey.tmp")

            try {
                Log.d(TAG, "Mulai download offline MP3 [$cleanKey] dari $audioUrl")
                val url = URL(audioUrl)
                connection = (url.openConnection() as HttpURLConnection).apply {
                    connectTimeout = 20000
                    readTimeout = 25000
                    instanceFollowRedirects = true
                    setRequestProperty("User-Agent", "SantriAI-Android/1.0")
                }
                connection.connect()

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream.use { input ->
                        FileOutputStream(tempFile).use { output ->
                            val buffer = ByteArray(8192)
                            var bytesRead: Int
                            while (input.read(buffer).also { bytesRead = it } != -1) {
                                output.write(buffer, 0, bytesRead)
                            }
                            output.flush()
                        }
                    }

                    if (tempFile.exists() && tempFile.length() > 5000) {
                        if (targetFile.exists()) targetFile.delete()
                        success = tempFile.renameTo(targetFile)
                        Log.d(TAG, "Berhasil menyimpan offline MP3 [$cleanKey]: ${targetFile.absolutePath}")
                    } else {
                        tempFile.delete()
                    }
                } else {
                    Log.w(TAG, "Gagal unduh [$cleanKey], HTTP Response: ${connection.responseCode}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error saat mengunduh MP3 adzan [$cleanKey]: ${e.message}")
                if (tempFile.exists()) tempFile.delete()
            } finally {
                connection?.disconnect()
                onComplete?.invoke(success, if (success) targetFile else null)
            }
        }
    }

    private fun sanitizeKey(key: String): String {
        return key.lowercase()
            .trim()
            .replace("[^a-z0-9_]+".toRegex(), "_")
            .trim('_')
            .ifEmpty { "default_adzan" }
    }
}
