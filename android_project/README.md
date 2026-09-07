# Proyek Android Studio - Santri AI (Modern)
**Package Name:** `com.kitabkuningterjemahlengkap`

Proyek ini merupakan pembungkus resmi Android (Native WebView Shell) yang menghubungkan antarmuka web React dengan perangkat keras Android secara penuh (AdMob, Google Play Billing, Statusbar Adzan, Media Murottal, GPS Otomatis, dan Tautan Toko Santri).

---

## 📁 Struktur Berkas

```
android_project/
├── build.gradle.kts                      # Konfigurasi plugin root Gradle
├── settings.gradle.kts                   # Pengaturan repositori Google & Maven
├── app/
│   ├── build.gradle.kts                  # Dependensi AdMob, Billing v7, Location, Media
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml       # Izin sistem & deklarasi Activity
│           ├── res/
│           │   ├── layout/
│           │   │   └── activity_main.xml # Layout antarmuka WebView
│           │   └── values/
│           │       ├── colors.xml        # Palet warna Santri AI
│           │       ├── strings.xml       # Nama aplikasi
│           │       └── themes.xml        # Tema aplikasi (NoActionBar)
│           └── java/
│               └── com/
│                   └── kitabkuningterjemahlengkap/
│                       ├── MainActivity.kt       # Activity utama & inisialisasi WebView
│                       ├── WebAppInterface.kt    # Jembatan JavaScript <-> Kotlin Android
│                       └── NotificationHelper.kt # Pengelola notifikasi Adzan & bilah audio
```

---

## 🛠️ Cara Membuka di Android Studio
1. Ekspor repositori ini ke **GitHub** atau unduh sebagai **ZIP** melalui menu **Settings > Export to GitHub / Download ZIP** di AI Studio.
2. Buka **Android Studio**.
3. Pilih menu **File > Open...** lalu arahkan ke folder `android_project`.
4. Tunggu proses **Gradle Sync** selesai.
5. Jalankan aplikasi pada perangkat fisik atau Emulator Android.

---

## ✨ Fitur-Fitur yang Sudah Terintegrasi
1. **AdMob Aman (Anti Invalid Traffic):** Menggunakan Test Ad Unit ID secara bawaan untuk pengujian yang aman sebelum rilis.
2. **Google Play Billing v7:** Menangani pembelian donasi, kuota wasilah, dan item toko dengan callback langsung ke `window.onPurchaseSuccess`.
3. **Notifikasi Adzan Status Bar:** Notifikasi waktu sholat dengan tingkat prioritas tinggi (Heads-Up).
4. **Bilah Pemutar Murottal:** Kontrol interaktif di status bar (Sebelumnya, Putar/Jeda, Selanjutnya, Tutup) yang tersinkronisasi dengan `window.AppMediaControls`.
5. **Pop-up GPS Otomatis:** Menampilkan dialog bawaan Google Play Services untuk menyalakan GPS otomatis saat santri menekan tombol *Ganti Lokasi*.
6. **Deep Link Toko Santri:** Tautan Shopee, Tokopedia, dan WhatsApp otomatis membuka aplikasi aslinya di perangkat tanpa error skema.
