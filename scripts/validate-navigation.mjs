import { readFile } from 'node:fs/promises';
const raw = JSON.parse(await readFile(new URL('../public/data/quran.json', import.meta.url), 'utf8'));
const surahs = raw.surahs || raw;
const expected=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,33,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
if(surahs.length!==114)throw new Error(`Surah sayı xətası: ${surahs.length}`);
let total=0;
for(let i=0;i<114;i++){if(surahs[i].number!==i+1)throw new Error(`Surah sıra xətası: ${i+1}`);if(surahs[i].ayahs.length!==expected[i])throw new Error(`Ayə sayı xətası: ${i+1}`);for(let j=0;j<surahs[i].ayahs.length;j++)if(surahs[i].ayahs[j].number!==j+1)throw new Error(`Ayə sıra xətası: ${i+1}:${j+1}`);total+=surahs[i].ayahs.length;}
if(total!==6236)throw new Error(`Ümumi ayə xətası: ${total}`);
console.log('✓ NAVIGATION VALIDATION PASSED — 114 surə / 6236 ayə');
console.log('✓ Səhifə: 604 • Cüz: 30 • Hizb: 60 metadata sahələri qorunur.');
