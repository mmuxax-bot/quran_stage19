# Stage 18 — KFGQPC Hafs Smart source wiring

This stage pins the Quran text acquisition pipeline to the KFGQPC Hafs Smart developer dataset.

Source: King Fahd Glorious Quran Printing Complex developer platform.
Mirror: thetruetruth/quran-data-kfgqpc, hafs-smart/data/hafs_smart_v8.json.

The project does NOT invent Quran text and does NOT mark a release as complete until the downloaded source validates to the expected 114 surahs / 6236 ayahs and required fields.

Expected fields include: id, jozz, sora_no, sora_name_en, sora_name_ar, page, line_start, line_end, aya_no, aya_text, aya_text_emlaey.

Important: KFGQPC describes Hafs Smart as verse-level Uthmanic text for smart devices, not a page-identical Madinah Mushaf layout. Therefore this source is used for accurate ayah text/search; the 604-page visual Mushaf remains a separate layout layer.
