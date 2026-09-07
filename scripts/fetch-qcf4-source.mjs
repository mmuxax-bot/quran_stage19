import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'public', 'data', 'qcf4-source.json');
const manifest = {
  provider: 'QCF4 Quran Database',
  source: 'https://github.com/MohamadHajjRabee/quran-qcf4',
  rawBase: 'https://raw.githubusercontent.com/MohamadHajjRabee/quran-qcf4/main',
  totalPages: 604,
  totalChapters: 114,
  totalVerses: 6236,
  fontCount: 47,
  files: {
    index: 'index.json',
    verses: 'verses.json',
    fontMap: 'font-map.json',
    pages: 'pages/NNN.json'
  },
  note: 'QCF4 is page-accurate Madinah Mushaf layout data; download/build step is required before offline packaging.'
};
fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
console.log(`Wrote ${out}`);
