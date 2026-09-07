import { readFile } from 'node:fs/promises';
const file = new URL('../src/data/quran.json', import.meta.url);
const raw = JSON.parse(await readFile(file, 'utf8'));
const surahs = raw.surahs || raw;
const ayahs = surahs.reduce((n, s) => n + s.verses.length, 0);
const expected = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,33,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
if (surahs.length !== 114) throw new Error(`114 surə tələb olunur, ${surahs.length} var.`);
if (ayahs !== 6236) throw new Error(`6236 ayə tələb olunur, ${ayahs} var.`);
for (let i=0;i<114;i++) {
  if (surahs[i].number !== i+1) throw new Error(`Surə sıra xətası: ${i+1}`);
  if (surahs[i].verses.length !== expected[i]) throw new Error(`Ayə sayı xətası: surə ${i+1}`);
}
console.log('QURAN DATA VALIDATION PASSED: 114 surah / 6236 ayah.');
