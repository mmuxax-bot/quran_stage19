import fs from 'node:fs';
import path from 'node:path';
const p = path.join(process.cwd(), 'public', 'data', 'qcf4-source.json');
const x = JSON.parse(fs.readFileSync(p, 'utf8'));
const ok = x.totalPages === 604 && x.totalChapters === 114 && x.totalVerses === 6236 && x.fontCount === 47;
if (!ok) { console.error('QCF4 manifest validation failed'); process.exit(1); }
console.log('QCF4 manifest OK: 604 pages / 114 surahs / 6236 ayahs / 47 fonts');
