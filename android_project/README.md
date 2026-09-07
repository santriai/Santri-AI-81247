# Proyek Android Studio - Santri AI (Modern)
**Package Name:** `com.kitabkuningterjemahlengkap`

Proyek ini merupakan pembungkus resmi Android (Native WebView Shell) yang menghubungkan antarmuka web React AI Studio dengan seluruh perangkat keras Android dan Firebase Cloud Messaging (FCM).

---

## 📁 Struktur Berkas

```
android_project/
├── build.gradle.kts                      # Plugin Android & Google Services 4.4.2
├── settings.gradle.kts                   # Repositori Google & MavenCentral
├── README.md                             # Panduan lengkap integrasi
├── app/
│   ├── build.gradle.kts                  # Dependensi FCM, AdMob, Billing v7, Location, Media
│   ├── google-services.json              # Berkas konfigurasi resmi Firebase (Project: santriai)
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml       # Izin Kamera, Mic, Notifikasi, Media, FCM & FileProvider
│           ├── res/
│           │   ├── layout/
│           │   │   └── activity_main.xml # Layout antarmuka WebView
│           │   ├── xml/
│           │   │   └── file_paths.xml    # Konfigurasi FileProvider untuk Kamera
│           │   └── values/
│           │       ├── colors.xml        # Palet warna tema Santri AI
│           │       ├── strings.xml       # Nama aplikasi
│           │       └── themes.xml        # Tema aplikasi (NoActionBar)
│           └── java/
│               └── com/
│                   └── kitabkuningterjemahlengkap/
│                       ├── MainActivity.kt                  # Activity utama, WebChromeClient (Kamera, Mic, GPS, Navigasi FCM)
│                       ├── WebAppInterface.kt               # Jembatan Murottal, Adzan, FCM, TTS, Iklan, Billing
│                       ├── NotificationHelper.kt            # Notifikasi FCM, Adzan & Bilah Kontrol Pemutar Murottal
│                       └── SantriFirebaseMessagingService.kt # Eksekutor Pesan Push Notifikasi FCM di Latar Belakang
```

---

## 🔔 Arsitektur Notifikasi Status Bar FCM (Pemberi Perintah vs Eksekutor):

### 1. Website / AI Studio (Pemberi Perintah / Pengendali)
* **Berlangganan Topik FCM**: Menginstruksikan Android untuk mendaftarkan perangkat ke topik siaran:
  ```javascript
  window.AndroidNativeInterface.subscribeToTopic('semua_santri');
  window.AndroidNativeInterface.subscribeToTopic('kajian_harian');
  ```
* **Mendapatkan Token FCM**: Meminta token unik perangkat santri dari Android:
  ```javascript
  window.AndroidNativeInterface.getFcmToken();
  // Hasil token dikirimkan kembali ke callback:
  window.onFcmTokenReceived = (token) => {
    localStorage.setItem('santriai_fcm_token', token);
  };
  ```
* **Perintah Langsung Tampilkan Notifikasi Status Bar**:
  ```javascript
  window.AndroidNativeInterface.showNotification(title, message, 'broadcast');
  window.AndroidNativeInterface.showNotificationWithAction(title, message, 'kajian', 'quran', url);
  ```
* **Pemberi Respon Navigasi saat Notifikasi Diklik**:
  ```javascript
  window.handleFcmNavigation = (targetScreen, targetUrl) => {
    // Otomatis berpindah layar ke Jadwal Sholat, Al-Qur'an, Chat AI, dll.
  };
  ```
* **Pengecualian Optimasi Baterai**:
  ```javascript
  window.AndroidNativeInterface.requestBatteryOptimizationExemption();
  ```

### 2. Android Studio / Kotlin (Eksekutor Sistem & Perangkat Keras)
* **`SantriFirebaseMessagingService.kt`**:
  - Menerima sinyal FCM baik saat aplikasi dibuka, di latar belakang (*background*), maupun saat aplikasi mati (*killed state*).
  - Menguraikan data notifikasi: `title`, `body`, `type` (`adzan` / `broadcast` / `kajian`), `targetScreen`, dan `targetUrl`.
  - Jika tipe adalah `adzan`: Memunculkan notifikasi adzan darurat (*Heads-up*) serta memutar audio MP3 adzan.
  - Jika tipe pengumuman/kajian: Mengirimkan notifikasi status bar prioritas tinggi yang dapat diperluas (*BigTextStyle*).
* **`MainActivity.kt` & `NotificationHelper.kt`**:
  - Saat santri mengklik notifikasi di status bar Android, `MainActivity` dibuka secara `singleTop` dan langsung mengeksekusi navigasi web:
    `window.handleFcmNavigation(targetScreen, targetUrl)`
  - Meneruskan token baru (`onNewToken`) langsung ke website melalui `window.onFcmTokenReceived(token)`.

---

## 🕌 Fitur-Fitur Perangkat Keras Lain yang Sudah Terintegrasi:

1. **Pemutar Murottal & Audio MP3:**
   - Pemutaran audio native streaming & offline via `MediaPlayer`.
   - Bilah kontrol notifikasi di status bar Android (Sebelumnya, Putar/Jeda, Selanjutnya, Tutup) yang tersinkronisasi dua arah dengan `window.AppMediaControls`.
2. **Kamera & Scan Kitab (OCR):**
   - Akses WebRTC Kamera (`navigator.mediaDevices.getUserMedia`) disetujui otomatis.
   - `onShowFileChooser` + `FileProvider` untuk jepret foto kitab langsung atau unggah dari galeri.
3. **Microphone (Tanya AI & Tes Tahfidz):**
   - Izin `RECORD_AUDIO` dan `PermissionRequest.RESOURCE_AUDIO_CAPTURE` aktif untuk input suara santri.
4. **Text-To-Speech (TTS):**
   - Mendukung audio format Base64 dan cadangan TextToSpeech bawaan Android bahasa Indonesia (`id-ID`).
5. **Pop-up GPS Otomatis:**
   - Menampilkan dialog resmi Google Play Services saat tombol *Ganti Lokasi* ditekan.
6. **AdMob & Google Play Billing:**
   - Interstitial & Rewarded Video Ads.
   - Pembelian produk / donasi in-app Play Store v7.
