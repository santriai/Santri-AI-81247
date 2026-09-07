plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.kitabkuningterjemahlengkap"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kitabkuningterjemahlengkap"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.10.0")

    // Firebase BOM & Firebase Cloud Messaging (FCM Push Notifications)
    implementation(platform("com.google.firebase:firebase-bom:33.9.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")

    // Google Mobile Ads (AdMob)
    implementation("com.google.android.gms:play-services-ads:23.6.0")

    // Google Play Billing (v7)
    implementation("com.android.billingclient:billing-ktx:7.1.1")

    // Google Location Services (Dialog Otomatis Pengaktifan GPS)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // Media Notification (Kontrol Pemutar Audio Murottal di Status Bar)
    implementation("androidx.media:media:1.7.0")
}
