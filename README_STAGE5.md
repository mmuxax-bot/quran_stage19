# Quran Hifz — Stage 5

Bu build-də istifadəçinin göstərdiyi Quran oxuyucu görünüşünə uyğun qaranlıq Mushaf UI və 2-ci mərhələnin naviqasiya infrastrukturu əlavə olunub.

## UI
- Qaranlıq Quran oxuyucu
- Yuxarıda menyu + surə məlumatı + axtarış + hədiyyə + parametrlər
- Böyük Uthmani/Naskh tipli ərəb mətn sahəsi
- Ayə nişanları
- Audio / Gizlə / Tərcümə / Yadda saxla idarələri
- Aşağı Hifz paneli və mikrofon düyməsi
- Açıq/qaranlıq oxu rejimi

## 2-ci mərhələ
- Surə naviqasiyası
- Səhifə naviqasiyası (1–604 UI)
- Cüz naviqasiyası (1–30 UI)
- Hizb naviqasiyası (1–60 UI)
- Axtarış
- Surə seçimi

## Vacib
Bu ZIP hələ APK deyil və Termux build addımları qəsdən daxil edilməyib.
Tam Quran `src/data/quran.json` faylına hazır olduqda oxuyucu avtomatik real ayə mətnlərini istifadə edir. Mətnin 114 surə / 6236 ayə olduğunu validation script yoxlayır.

Növbəti inkişaf mərhələsində səhifə/cüz/hizb indekslərini real Quran metadata ilə bağlamaq, tərcümə, audio keşləmə, hifz imtahanı və səsli yoxlama modullarını tamamlayacağıq.
