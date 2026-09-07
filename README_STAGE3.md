# Quran Hifz — Stage 3

Bu mərhələdə tətbiq demo ayələrdən real Quran məlumat modelinə keçirilir.

## Əlavələr
- 114 surah və 6236 ayə üçün avtomatik Quran data endirmə
- Uthmani Quran mətni üçün real data mənbəyi
- Surah → ayə siyahısı
- Ayə gizlətmə/göstərmə
- Hifz sessiyası
- Ayə üzrə audio düyməsi üçün EveryAyah URL qurucusu
- Daha güclü təkrar/review məlumat modeli
- Offline işləmək üçün data build zamanı `src/data/quran.json`-a saxlanılır
- 6236 ayə sayına avtomatik yoxlama

## Termux

```bash
pkg update
pkg install nodejs git unzip
unzip quran_hifz_stage3.zip
cd quran_hifz_stage3
npm install
npm run prepare:quran
npm run build
npx cap add android
npx cap sync android
```

Sonrakı APK build:

```bash
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

## Məlumat mənbəyi
Quran mətni build zamanı `risan/quran-json` layihəsinin Quran JSON faylından alınır. Layihə öz README-sində Uthmani mətnin The Noble Qur'an Encyclopedia-dan gəldiyini bildirir. İstehsal tətbiqində mənbə/lisenziya bildirişi saxlanmalıdır.
