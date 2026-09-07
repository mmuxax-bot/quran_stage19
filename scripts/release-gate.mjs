import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'public/data/quran.json');
const fail = (m) => { console.error(`RELEASE BLOCKED: ${m}`); process.exit(1); };
if (!fs.existsSync(file)) fail('public/data/quran.json is missing.');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const surahs = Array.isArray(data.surahs) ? data.surahs : [];
const ayahs = surahs.reduce((n, s) => n + (Array.isArray(s.ayahs) ? s.ayahs.length : 0), 0);
if (surahs.length !== 114) fail(`expected 114 surahs, found ${surahs.length}`);
if (ayahs !== 6236) fail(`expected 6236 ayahs, found ${ayahs}`);
for (const s of surahs) {
  if (!s.name_arabic || !Array.isArray(s.ayahs)) fail(`invalid surah structure: ${s.number}`);
  for (const a of s.ayahs) if (!a.text?.trim()) fail(`empty ayah text: ${s.number}:${a.number}`);
}
console.log('RELEASE GATE PASSED: 114 surahs / 6236 ayahs with non-empty text.');
