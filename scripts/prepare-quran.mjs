import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SOURCES = [
  'https://raw.githubusercontent.com/mjmirza/quran-dataset/main/data/quran.json',
  'https://raw.githubusercontent.com/wp-dynamo/quran-json/main/dist/quran.json'
];
const out = join(process.cwd(), 'public', 'data', 'quran.json');

function normalizeRich(raw) {
  const list = Array.isArray(raw) ? raw : (raw.surahs || raw.data || []);
  return list.map((s, i) => ({
    number: Number(s.number || s.id || i + 1),
    name_arabic: s.name_arabic || s.name || s.arabic || '',
    name_transliteration: s.name_transliteration || s.transliteration || s.en || '',
    ayahs: (s.ayahs || s.verses || []).map((v, j) => ({
      number: Number(v.number || v.number?.inSurah || v.verse || j + 1),
      text: v.text || v.text_uthmani || v.arabic || v.content || '',
      page: Number(v.page || 0),
      juz: Number(v.juz || 0),
      hizb: Number(v.hizb || 0),
      hizb_quarter: Number(v.hizb_quarter || v.hizbQuarter || 0),
      rub: Number(v.rub || 0),
    }))
  }));
}

async function fetchSource(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let raw; let lastError;
for (const url of SOURCES) {
  try { console.log(`Quran mənbə yoxlanılır: ${url}`); raw = await fetchSource(url); break; }
  catch (e) { lastError = e; console.warn(`Alınmadı: ${e.message}`); }
}
if (!raw) throw new Error(`Quran məlumatı alınmadı: ${lastError?.message || 'naməlum xəta'}`);

const surahs = normalizeRich(raw);
const ayahs = surahs.reduce((n, s) => n + s.ayahs.length, 0);
if (surahs.length !== 114) throw new Error(`114 surə tələb olunur, ${surahs.length} var.`);
if (ayahs !== 6236) throw new Error(`6236 ayə tələb olunur, ${ayahs} var.`);
for (const s of surahs) {
  if (!s.ayahs.length) throw new Error(`Boş surə: ${s.number}`);
  for (const v of s.ayahs) if (!v.text.trim()) throw new Error(`Boş ayə: ${s.number}:${v.number}`);
}

await mkdir(join(process.cwd(), 'public', 'data'), { recursive: true });
await writeFile(out, JSON.stringify({
  source: 'Quran Dataset / metadata-rich Quran JSON',
  counts: { surahs: 114, ayahs: 6236 },
  navigation: { pages: 604, juz: 30, hizb: 60 },
  surahs
}, null, 2), 'utf8');
console.log('✓ Quran + ayə naviqasiya datası hazırdır: 114 surə / 6236 ayə.');
