# Quran Hifz — Stage 7: Mushaf Naviqasiyası

Bu mərhələ Stage 6 üzərində qurulub. Məqsəd Quran daxilində **Səhifə, Cüz, Hizb və Rub** üzrə naviqasiyanı real metadata ilə işləyəcək şəkildə hazırlamaqdır.

## Əlavə edilənlər
- 604 səhifə naviqasiyası
- 30 cüz naviqasiyası
- 60 hizb naviqasiyası
- 240 rub naviqasiyası
- Seçilmiş bölmənin uyğun ayəsinə avtomatik keçid
- Bölmə nömrəsinə birbaşa keçid sahəsi
- Son seçilmiş səhifə/cüz/hizb/rub-un localStorage-da saxlanması
- Quran metadata hazır deyilsə, interfeys yenə işləyir və məlumatın hazır olmadığını göstərir
- Quran mətninin yazı üslubu ilə tətbiqin gündüz/gecə mövzusu bir-birindən ayrı saxlanılır

## Vacib
APK hələ hazırlanmayıb.
Bu mərhələdə Termux əmrləri verilmir.

## Real Quran məlumatı
`public/data/quran.json` hazırlıq mərhələsində 114 surə / 6236 ayə metadata ilə doldurulmalıdır. `scripts/prepare-quran.mjs` bunu avtomatik normallaşdırmaq üçün hazırdır.

Məlumat daxil olduqda page/juz/hizb/rub sahələri birbaşa ayə metadata-sından tapılır və seçim həmin ayəyə aparır.
