# Stage 19 — QCF4 Mushaf Layout Integration

This stage separates two Quran rendering layers:

1. **KFGQPC Unicode Uthmani Hafs** for ayah-level text, search, memorization and voice comparison.
2. **QCF4** for page-accurate Madinah Mushaf rendering.

QCF4 provides 604 page JSON files, a verse-to-page index, a page-to-font map, and 47 Hafs font files. The project stores a pinned source manifest and validation script. The actual source payload is intentionally not fabricated or substituted.

## Release rule
The final APK must not be released until the QCF4 payload and KFGQPC ayah payload have both been downloaded, normalized and validated locally.

## Checks
- 604 pages
- 114 surahs
- 6236 ayahs
- 47 QCF4 font files
- verse-to-page lookup
- page-to-font lookup
- offline asset existence
