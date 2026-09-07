# Stage 15 — Final Integration & QA

This stage is a release-readiness pass over the cumulative Quran Hifz project.

## Included
- Static integration checks for required files and package scripts.
- JavaScript syntax validation for the application and Quran preparation scripts.
- Checks for the 114-surah / 604-page navigation references.
- Checks for local persistence and separate light/dark reader themes.
- Checks that the voice-check module remains present.
- Explicit release warning when `public/data/quran.json` is still the preparation placeholder.

## Important
This is **not yet the final APK**. Termux/Android build commands are intentionally excluded.

The full Quran dataset is prepared by `scripts/prepare-quran.mjs` and should be generated before a production build. The repository currently keeps a tiny placeholder JSON so the project can be packaged without silently claiming that 6236 ayahs are already bundled.

## QA command
Run:
`npm run qa`

For a production data preparation flow, first run the existing Quran preparation/validation scripts, then run QA and the Vite build.
