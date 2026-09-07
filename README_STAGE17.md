# Stage 17 — Real Quran Data Source & Integrity Gate

Bu mərhələdə Quran məlumatının mənbə və inteqrasiya siyasəti sərtləşdirildi.

## Mənbə
King Fahd Glorious Quran Printing Complex (KFGQPC) rəsmi developer səhifəsi Uthmanic Hafs məlumatını və smart-device üçün Hafs məlumatını developer formatlarında təqdim edir. Məlumat sahələrinə surə, ayə, səhifə, cüz və Uthmani Hafs mətn sahələri daxildir.

Rəsmi məlumat səhifəsi:
https://qurancomplex.gov.sa/en/techquran/dev/

KFGQPC məlumatının GitHub-da developer üçün mirror-i də mövcuddur:
https://github.com/thetruetruth/quran-data-kfgqpc

## Vacib
Bu ZIP-in içinə internetdən yüklənmiş Quran mətnini saxta şəkildə "tam paket" kimi qoymadım. Build mühitində xarici GitHub/KFGQPC faylını əldə etmək mümkün olmadığından `public/data/quran.json` placeholder olaraq qalır. `prepare-kfgqpc.mjs` real mənbədən məlumatı əldə edib tətbiqin normalizə olunmuş formatına çevirmək üçün hazırlanıb.

Release yalnız 114 surə və 6236 ayə yoxlaması keçəndən sonra mümkündür.
