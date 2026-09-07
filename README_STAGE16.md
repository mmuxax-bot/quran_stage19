# Stage 16 — Release Gate & Offline Readiness

This stage hardens the project before APK generation.

## Added
- A strict `release-gate` that refuses a production release unless the bundled Quran contains exactly 114 surahs and 6236 ayahs with non-empty text.
- A web manifest for standalone/offline-oriented app packaging.
- The manifest is linked from `index.html`.

## Important
The current archive still contains the small Quran preparation placeholder. Therefore the release gate is intentionally expected to BLOCK until `npm run prepare:quran` has produced the full dataset and `npm run validate:quran` succeeds.

No Termux commands and no APK build are included yet.

## Release sequence later
1. Prepare the full Quran dataset.
2. Validate 114 surahs / 6236 ayahs and structural metadata.
3. Run `npm run release:gate`.
4. Run the production build.
5. Perform real-device Android QA.
6. Only then create the final APK.
