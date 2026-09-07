import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const url = 'https://raw.githubusercontent.com/risan/quran-json/refs/heads/main/dist/quran.json';
const out = join(process.cwd(), 'src', 'data', 'quran.json');

console.log('Quran məlumatı endirilir...');
const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) throw new Error(`Quran məlumatı yüklənmədi: ${res.status}`);
const text = await res.text();
const data = JSON.parse(text);
const surahs = Array.isArray(data) ? data : (data.surahs || data.data || []);
if (!Array.isArray(surahs) || surahs.length !== 114) throw new Error('Gözlənilən 114 surah tapılmadı.');
const count = surahs.reduce((n, s) => n + (s.verses?.length || s.ayahs?.length || 0), 0);
if (count !== 6236) throw new Error(`Gözlənilən 6236 ayə əvəzinə ${count} ayə tapıldı.`);
await mkdir(join(process.cwd(), 'src', 'data'), { recursive: true });
await writeFile(out, JSON.stringify(data));
console.log(`Hazırdır: 114 surah / ${count} ayə`);
console.log(`Fayl: ${out}`);
