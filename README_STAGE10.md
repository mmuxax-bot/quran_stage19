# Quran Hifz — Stage 10: Hifz Test / Exam

This stage adds a functional local Hifz examination layer on top of Stage 9.

## Added
- 10-question Hifz test generated from the loaded 6236-ayah Quran dataset.
- Three question types:
  1. Find the next ayah.
  2. Identify the ayah number.
  3. Identify the surah.
- Four randomized choices where applicable.
- Immediate correct/wrong visual feedback.
- Score and percentage calculation.
- Result screen with simple grade.
- Up to 20 recent test results stored locally.
- Best score shown on the test start screen.
- Works offline after Quran data is present because question generation is local.

## Important
The test uses the real Arabic ayah text from `public/data/quran.json` once the 6236-ayah dataset is prepared. It does not claim voice recognition; that belongs to a later stage.

APK/Termux build is intentionally not included yet.
