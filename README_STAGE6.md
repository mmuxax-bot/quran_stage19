# Stage 6 — Quran Surah + Ayah Navigation

Bu mərhələ APK mərhələsi deyil. Məqsəd Quran bölməsinin naviqasiya nüvəsini hazırlamaqdır.

## Əlavə olunanlar
- 114 surənin tam siyahısı
- Surə adı/nömrəsi ilə axtarış
- Surə seçimi
- Seçilmiş surənin ayə siyahısı
- Ayə nömrəsi ilə keçid
- Ayəyə toxunaraq Quran oxu ekranına keçid
- Əvvəlki/növbəti ayə
- Quran oxu ekranında 5 ayəlik davamlı görünüş
- Ayə gizlət/göstər
- Səhifə/Cüz/Hizb naviqasiya interfeysi
- 604 səhifə / 30 cüz / 60 hizb metadata sahələri üçün model
- Gündüz/gecə rejimi ayrıca idarə olunur

## Məlumat prinsipi
Quran datası APK mərhələsində yox, sonrakı final build hazırlığında `prepare:quran` ilə `public/data/quran.json`-a hazırlanır. Bu ZIP-in məqsədi arxitekturanı və UI-nı tamamlamaqdır; hələ APK çıxarılmır.

## Məlumat yoxlaması
`validate:navigation` 114 surə, 6236 ayə və hər surənin ayə sırasını yoxlayır.

## Mənbə qeydi
Metadata-rich Quran dataset 114 surə, 6236 ayə, 604 Mushaf səhifəsi, 30 cüz və 60 hizb strukturunu təqdim edir. İstehsal buraxılışında mənbə/lisenziya qeydləri saxlanmalıdır.
