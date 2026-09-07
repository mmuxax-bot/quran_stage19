import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'public', 'data', 'quran.json');
const manifest = path.join(root, 'public', 'data', 'quran-source.json');

const SOURCES = [
  'https://qurancomplex.gov.sa/en/techquran/dev/',
  'https://github.com/thetruetruth/quran-data-kfgqpc'
];

const canonical = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

function validate(data) {
  if (!Array.isArray(data) || data.length !== 114) throw new Error(`Expected 114 surahs, got ${data?.length}`);
  let total = 0;
  for (let i = 0; i < 114; i++) {
    const s = data[i];
    if (!Array.isArray(s.ayahs) || s.ayahs.length !== canonical[i]) {
      throw new Error(`Surah ${i + 1}: expected ${canonical[i]} ayahs`);
    }
    s.ayahs.forEach((a, idx) => {
      if (!a.text || !String(a.text).trim()) throw new Error(`Empty text at ${i + 1}:${idx + 1}`);
      if (Number(a.number) !== idx + 1) throw new Error(`Bad ayah numbering at ${i + 1}:${idx + 1}`);
    });
    total += s.ayahs.length;
  }
  if (total !== 6236) throw new Error(`Expected 6236 ayahs, got ${total}`);
  return total;
}

function normalize(raw) {
  // Supports KFGQPC-style arrays/objects after the raw download is supplied.
  const rows = Array.isArray(raw) ? raw : (raw.data || raw.ayahs || raw.verses || []);
  if (!rows.length) throw new Error('No Quran rows found in downloaded source.');
  const map = new Map();
  for (const r of rows) {
    const surah = Number(r.sura_no ?? r.surah ?? r.surah_number ?? r.chapter);
    const ayah = Number(r.aya_no ?? r.ayah ?? r.ayah_number ?? r.verse);
    const text = r.aya_text ?? r.text ?? r.uthmani ?? r.ayah_text;
    if (!surah || !ayah || !text) continue;
    if (!map.has(surah)) map.set(surah, { number: surah, name_arabic: r.sura_name_ar ?? '', name_transliteration: r.sura_name_en ?? '', ayahs: [] });
    map.get(surah).ayahs.push({ number: ayah, text: String(text), page: Number(r.page) || null, juz: Number(r.jozz ?? r.juz) || null, line_start: Number(r.line_start) || null, line_end: Number(r.line_end) || null });
  }
  const data = [...map.values()].sort((a,b)=>a.number-b.number);
  data.forEach(s => s.ayahs.sort((a,b)=>a.number-b.number));
  return data;
}

const rawPath = process.argv[2];
if (!rawPath) {
  console.error('Usage: node scripts/prepare-kfgqpc.mjs <downloaded-kfgqpc-json>');
  console.error('Sources:', ...SOURCES);
  process.exit(2);
}

const raw = JSON.parse(fs.readFileSync(path.resolve(rawPath), 'utf8'));
const data = normalize(raw);
const total = validate(data);
fs.writeFileSync(out, JSON.stringify(data));
fs.writeFileSync(manifest, JSON.stringify({source:'KFGQPC Uthmanic Hafs', urls:SOURCES, ayahs:total, surahs:114, generatedAt:new Date().toISOString()}, null, 2));
console.log(`Prepared ${data.length} surahs / ${total} ayahs`);
